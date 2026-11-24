#!/usr/bin/env python3
"""InVoyage site server: hardened static host + waitlist API. Python standard library only.

Defences: strict CSP and security headers, method/path allowlists, dotfile and traversal blocking, request size and
time limits, connection cap, signed CSRF token (cookie + body + time trap), same-origin check, honeypot, per-IP and
global rate limits, parameterised SQLite, hashed IPs, no user input ever echoed back, no admin endpoint.
"""
import hashlib, hmac, json, os, re, secrets, socket, sqlite3, sys, threading, time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent
PUBLIC = (ROOT / "public").resolve()
DATA = Path(os.environ.get("DATA_DIR", ROOT / "data"))
DATA.mkdir(mode=0o700, parents=True, exist_ok=True)
HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8080"))
TRUST_PROXY = os.environ.get("TRUST_PROXY") == "1"      # behind Caddy/nginx: use X-Forwarded-* headers
SITE_ORIGIN = os.environ.get("SITE_ORIGIN", "").rstrip("/")  # e.g. https://invoyage.example (recommended in production)
MAX_BODY = 2048
MAX_CONNECTIONS = int(os.environ.get("MAX_CONNECTIONS", "64"))
TOKEN_MIN_AGE, TOKEN_MAX_AGE = 2, 3600                   # seconds: time trap against instant bot submits
LIMIT_IP_PER_HOUR = int(os.environ.get("LIMIT_IP_PER_HOUR", "8"))        # every POST attempt counts, valid or not
LIMIT_GLOBAL_PER_HOUR = int(os.environ.get("LIMIT_GLOBAL_PER_HOUR", "300"))
LIMIT_TOKEN_PER_MIN = int(os.environ.get("LIMIT_TOKEN_PER_MIN", "60"))

CSP = ("default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; "
       "connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; "
       "manifest-src 'none'; upgrade-insecure-requests")
TYPES = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
         ".woff2": "font/woff2", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
         ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".ico": "image/x-icon"}
EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9\-]{1,63}(\.[A-Za-z0-9\-]{1,63})*\.[A-Za-z]{2,24}$")
LINK_HOSTS = ("t.me", "telegram.me", "www.instagram.com", "instagram.com", "www.youtube.com", "youtube.com", "www.tiktok.com", "tiktok.com")

_secret_path = DATA / "secret.key"
if not _secret_path.exists():
    fd = os.open(_secret_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "wb") as fh:
        fh.write(secrets.token_bytes(32))
SECRET = _secret_path.read_bytes()

_db_lock = threading.Lock()
_db = sqlite3.connect(DATA / "subscribers.db", check_same_thread=False)
_db.execute("PRAGMA journal_mode=WAL")
_db.execute("CREATE TABLE IF NOT EXISTS subscribers (email TEXT PRIMARY KEY, consent_at INTEGER NOT NULL, created_at INTEGER NOT NULL, ip_hash TEXT NOT NULL)")
_db.commit()
try:
    os.chmod(DATA / "subscribers.db", 0o600)
except OSError:
    pass


class RateLimiter:
    def __init__(self):
        self.lock, self.hits = threading.Lock(), defaultdict(deque)

    def allow(self, key, limit, window):
        now = time.time()
        with self.lock:
            q = self.hits[key]
            while q and q[0] <= now - window:
                q.popleft()
            if len(q) >= limit:
                return False
            q.append(now)
            if len(self.hits) > 20000:                   # bound memory
                for k in [k for k, v in self.hits.items() if not v][:5000]:
                    self.hits.pop(k, None)
            return True


RL = RateLimiter()


def sign(payload: str) -> str:
    return hmac.new(SECRET, payload.encode(), hashlib.sha256).hexdigest()[:40]


def make_token() -> str:
    payload = f"{int(time.time())}.{secrets.token_hex(8)}"
    return f"{payload}.{sign(payload)}"


def check_token(tok: str) -> bool:
    try:
        ts, nonce, sig = tok.split(".")
        if not hmac.compare_digest(sig, sign(f"{ts}.{nonce}")):
            return False
        return TOKEN_MIN_AGE <= time.time() - int(ts) <= TOKEN_MAX_AGE
    except (ValueError, AttributeError):
        return False


def ip_hash(ip: str) -> str:
    return hmac.new(SECRET, ip.encode(), hashlib.sha256).hexdigest()[:24]


class Handler(BaseHTTPRequestHandler):
    server_version = "web"
    sys_version = ""
    protocol_version = "HTTP/1.1"
    timeout = 10                                         # per-connection socket timeout (slowloris)

    # -- plumbing -----------------------------------------------------------
    def log_message(self, fmt, *args):                   # never log query strings, bodies or e-mails
        sys.stderr.write("%s %s %s\n" % (self.command, urlsplit(self.path).path[:120], args[1] if len(args) > 1 else ""))

    def client_ip(self):
        if TRUST_PROXY:
            xff = self.headers.get("X-Forwarded-For", "")
            if xff:
                return xff.split(",")[-1].strip()[:64]
        return self.client_address[0]

    def https(self):
        return TRUST_PROXY and self.headers.get("X-Forwarded-Proto", "") == "https"

    def security_headers(self):
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")
        if self.https():
            self.send_header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")

    def respond(self, code, body=b"", ctype="text/plain; charset=utf-8", extra=None, head=False):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.security_headers()
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        if code >= 400 or self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if not head:
            self.wfile.write(body)

    def send_error(self, code, message=None, explain=None):   # generic, never echoes input
        self.respond(code, f"{code}\n".encode(), head=self.command == "HEAD")

    def json(self, code, obj, extra=None):
        self.respond(code, json.dumps(obj, ensure_ascii=False).encode(), "application/json; charset=utf-8", extra)

    # -- routing --------------------------------------------------------------
    def do_GET(self, head=False):
        path = urlsplit(self.path).path
        if path == "/api/token":
            return self.api_token()
        if path == "/api/links":
            return self.api_links()
        if path.startswith("/api/"):
            return self.send_error(404)
        self.static(path, head)

    def do_HEAD(self):
        self.do_GET(head=True)

    def do_POST(self):
        if urlsplit(self.path).path == "/api/subscribe":
            return self.api_subscribe()
        self.send_error(404)

    def _405(self):
        self.respond(405, b"405\n", extra={"Allow": "GET, HEAD, POST"})

    do_PUT = do_DELETE = do_PATCH = do_OPTIONS = do_TRACE = do_CONNECT = _405

    # -- static ----------------------------------------------------------------
    def static(self, path, head):
        if "\x00" in path or "\\" in path or "%" in path:
            return self.send_error(400)
        rel = "index.html" if path in ("", "/") else path.lstrip("/")
        parts = rel.split("/")
        if any(p == "" or p.startswith(".") for p in parts):
            return self.send_error(404)
        try:
            full = (PUBLIC / rel).resolve()
            full.relative_to(PUBLIC)
        except (ValueError, OSError):
            return self.send_error(404)
        ext = full.suffix.lower()
        if ext not in TYPES or not full.is_file():
            return self.send_error(404)
        body = full.read_bytes()
        cache = "no-cache" if ext == ".html" else "public, max-age=86400"
        self.respond(200, body, TYPES[ext], {"Cache-Control": cache}, head=head)

    # -- api ---------------------------------------------------------------------
    def api_token(self):
        if not RL.allow(("tok", self.client_ip()), LIMIT_TOKEN_PER_MIN, 60):
            return self.respond(429, b"429\n", extra={"Retry-After": "60"})
        tok = make_token()
        cookie = f"csrf={tok}; Path=/api; HttpOnly; SameSite=Strict; Max-Age={TOKEN_MAX_AGE}" + ("; Secure" if self.https() else "")
        self.json(200, {"token": tok}, {"Set-Cookie": cookie})

    def api_links(self):
        out = []
        try:
            cfg = json.loads((ROOT / "config.json").read_text("utf-8"))
        except (OSError, ValueError):
            cfg = {}
        for item in cfg.get("links", []):
            url, label = str(item.get("url", "")), str(item.get("label", ""))[:30]
            u = urlsplit(url)
            if u.scheme == "https" and u.hostname in LINK_HOSTS and label:      # only allow-listed HTTPS social hosts
                out.append({"label": label, "url": url})
        self.json(200, {"links": out})

    def origin_ok(self):
        origin = self.headers.get("Origin", "")
        if not origin:
            return False
        if self.headers.get("Sec-Fetch-Site", "same-origin") not in ("same-origin", "none"):
            return False
        if SITE_ORIGIN:
            return origin == SITE_ORIGIN
        return urlsplit(origin).netloc == self.headers.get("Host", "")

    def api_subscribe(self):
        ip = self.client_ip()
        if not RL.allow(("sub", ip), LIMIT_IP_PER_HOUR, 3600) or not RL.allow(("sub", "*"), LIMIT_GLOBAL_PER_HOUR, 3600):
            return self.respond(429, b"429\n", extra={"Retry-After": "3600"})
        if not self.origin_ok():
            return self.send_error(403)
        if not self.headers.get("Content-Type", "").lower().startswith("application/json"):
            return self.send_error(415)
        try:
            n = int(self.headers.get("Content-Length", ""))
        except ValueError:
            return self.send_error(411)
        if n < 0 or n > MAX_BODY:
            return self.send_error(413)
        try:
            data = json.loads(self.rfile.read(n))
            if not isinstance(data, dict):
                raise ValueError
        except (ValueError, UnicodeDecodeError, socket.timeout):
            return self.send_error(400)
        tok = data.get("token")
        cookie = ""
        for part in self.headers.get("Cookie", "").split(";"):
            k, _, v = part.strip().partition("=")
            if k == "csrf":
                cookie = v
        if not (isinstance(tok, str) and cookie and hmac.compare_digest(tok, cookie) and check_token(tok)):
            return self.send_error(400)
        if data.get("website"):                         # honeypot: bots fill it, humans never see it
            return self.json(200, {"ok": True})         # pretend success, store nothing
        email, consent = data.get("email"), data.get("consent")
        if consent is not True or not isinstance(email, str):
            return self.send_error(400)
        email = email.strip().lower()
        if len(email) > 254 or ".." in email or not EMAIL_RE.match(email):
            return self.send_error(400)
        now = int(time.time())
        with _db_lock:
            _db.execute("INSERT OR IGNORE INTO subscribers (email, consent_at, created_at, ip_hash) VALUES (?,?,?,?)",
                        (email, now, now, ip_hash(ip)))
            _db.commit()
        self.json(200, {"ok": True})                    # identical answer for new and duplicate (no enumeration)


class Server(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 64

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.slots = threading.BoundedSemaphore(MAX_CONNECTIONS)

    def process_request(self, request, client_address):
        if not self.slots.acquire(blocking=False):      # connection cap
            try:
                request.close()
            finally:
                return
        super().process_request(request, client_address)

    def process_request_thread(self, request, client_address):
        try:
            super().process_request_thread(request, client_address)
        finally:
            self.slots.release()


if __name__ == "__main__":
    print(f"listening on http://{HOST}:{PORT} (trust_proxy={TRUST_PROXY})", file=sys.stderr)
    Server((HOST, PORT), Handler).serve_forever()
