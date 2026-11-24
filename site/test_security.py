#!/usr/bin/env python3
"""Black-box security tests: starts the server on a random port with a temp data dir. Run: python3 test_security.py"""
import http.client, json, os, socket, subprocess, sys, tempfile, time, unittest, sqlite3

HERE = os.path.dirname(os.path.abspath(__file__))


def free_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


class T(unittest.TestCase):
    LIMIT = "1000"

    @classmethod
    def setUpClass(cls):
        cls.port, cls.tmp = free_port(), tempfile.mkdtemp()
        env = dict(os.environ, PORT=str(cls.port), DATA_DIR=cls.tmp, HOST="127.0.0.1", LIMIT_IP_PER_HOUR=cls.LIMIT, LIMIT_TOKEN_PER_MIN="1000")
        cls.proc = subprocess.Popen([sys.executable, os.path.join(HERE, "server.py")], env=env, stderr=subprocess.DEVNULL)
        for _ in range(50):
            try:
                socket.create_connection(("127.0.0.1", cls.port), 0.2).close(); break
            except OSError:
                time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.proc.terminate(); cls.proc.wait()

    def req(self, method, path, body=None, headers=None):
        c = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        c.request(method, path, body=body, headers=headers or {})
        r = c.getresponse(); data = r.read(); h = dict((k.lower(), v) for k, v in r.getheaders()); c.close()
        return r.status, h, data

    def token(self):
        s, h, d = self.req("GET", "/api/token")
        self.assertEqual(s, 200)
        return json.loads(d)["token"], h["set-cookie"].split(";")[0]

    def post(self, payload, cookie=None, origin=True, ctype="application/json", raw=None):
        hdr = {"Content-Type": ctype, "Host": f"127.0.0.1:{self.port}"}
        if origin: hdr["Origin"] = f"http://127.0.0.1:{self.port}"
        if cookie: hdr["Cookie"] = cookie
        return self.req("POST", "/api/subscribe", raw if raw is not None else json.dumps(payload), hdr)

    def test_01_headers_and_no_version_leak(self):
        s, h, d = self.req("GET", "/")
        self.assertEqual(s, 200)
        for k in ("content-security-policy", "x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy", "cross-origin-opener-policy"):
            self.assertIn(k, h)
        self.assertIn("frame-ancestors 'none'", h["content-security-policy"])
        self.assertNotIn("python", h.get("server", "").lower())
        self.assertNotIn("script-src 'unsafe", h["content-security-policy"])
        self.assertNotIn(b"<script>", d)                      # no inline scripts
        self.assertNotIn(b"style=", d)                         # no inline styles (CSP style-src 'self')

    def test_02_path_traversal_and_dotfiles(self):
        for p in ("/../server.py", "/..%2fserver.py", "/%2e%2e/server.py", "/.env", "/css/../../server.py", "/data/secret.key", "/server.py", "/config.json", "/img/../../config.json", "//etc/passwd", "/\\..\\server.py"):
            s, _, d = self.req("GET", p)
            self.assertIn(s, (400, 404), p)
            self.assertNotIn(b"HMAC", d); self.assertNotIn(b"SECRET", d)

    def test_03_methods(self):
        for m in ("PUT", "DELETE", "PATCH", "OPTIONS", "TRACE"):
            self.assertEqual(self.req(m, "/")[0], 405, m)
        self.assertEqual(self.req("HEAD", "/")[0], 200)

    def test_04_subscribe_rejections(self):
        tok, ck = self.token(); time.sleep(2.2)
        good = {"email": "a@b.co", "consent": True, "website": "", "token": tok}
        self.assertEqual(self.post(good, ck, origin=False)[0], 403)                       # no Origin
        self.assertEqual(self.post(good, None)[0], 400)                                   # no cookie
        self.assertEqual(self.post(dict(good, token="x.y.z"), "csrf=x.y.z")[0], 400)      # forged token
        self.assertEqual(self.post(dict(good, consent=False), ck)[0], 400)                # no consent
        self.assertEqual(self.post(dict(good, email="not-an-email"), ck)[0], 400)
        self.assertEqual(self.post(dict(good, email="a@b.co\r\nBcc: x@y.z"), ck)[0], 400) # header injection
        self.assertEqual(self.post(good, ck, ctype="text/plain")[0], 415)
        self.assertEqual(self.post(None, ck, raw="x" * 5000)[0], 413)
        self.assertEqual(self.post(None, ck, raw="{not json")[0], 400)
        s, _, _ = self.req("POST", "/api/subscribe", json.dumps(good), {"Content-Type": "application/json", "Origin": "http://evil.example", "Host": f"127.0.0.1:{self.port}", "Cookie": ck})
        self.assertEqual(s, 403)                                                          # cross-origin

    def test_05_time_trap(self):
        tok, ck = self.token()                                                            # used immediately
        self.assertEqual(self.post({"email": "fast@bot.co", "consent": True, "token": tok}, ck)[0], 400)

    def test_06_happy_path_honeypot_and_dedup(self):
        tok, ck = self.token(); time.sleep(2.2)
        s, _, d = self.post({"email": " Real.User@Example.COM ", "consent": True, "website": "", "token": tok}, ck)
        self.assertEqual((s, json.loads(d)), (200, {"ok": True}))
        s, _, d = self.post({"email": "real.user@example.com", "consent": True, "website": "", "token": tok}, ck)
        self.assertEqual((s, json.loads(d)), (200, {"ok": True}))                          # duplicate: identical answer
        s, _, d = self.post({"email": "bot@spam.co", "consent": True, "website": "http://spam", "token": tok}, ck)
        self.assertEqual(s, 200)                                                           # honeypot: fake success
        rows = sqlite3.connect(os.path.join(self.tmp, "subscribers.db")).execute("SELECT email, ip_hash FROM subscribers").fetchall()
        self.assertEqual([r[0] for r in rows], ["real.user@example.com"])
        self.assertNotIn("127.0.0.1", rows[0][1])                                          # IP is hashed
        self.assertEqual(oct(os.stat(os.path.join(self.tmp, "secret.key")).st_mode & 0o777), "0o600")

    def test_07_sql_injection_is_inert(self):
        tok, ck = self.token(); time.sleep(2.2)
        s, _, _ = self.post({"email": "x'; DROP TABLE subscribers;--@a.co", "consent": True, "token": tok}, ck)
        self.assertEqual(s, 400)
        n = sqlite3.connect(os.path.join(self.tmp, "subscribers.db")).execute("SELECT count(*) FROM subscribers").fetchone()[0]
        self.assertGreaterEqual(n, 0)

    def test_09_links_allowlist(self):
        s, _, d = self.req("GET", "/api/links"); self.assertEqual(s, 200)
        self.assertEqual(json.loads(d), {"links": []})


class RateLimit(T):
    LIMIT = "3"

    def test_rate_limit_blocks_after_limit(self):
        codes = [self.post({"email": "z@z.co", "consent": True, "token": "a.b.c"}, "csrf=a.b.c")[0] for _ in range(6)]
        self.assertEqual(codes[:3], [400, 400, 400])
        self.assertTrue(all(c == 429 for c in codes[3:]), codes)


for _n in [n for n in dir(RateLimit) if n.startswith("test_") and n != "test_rate_limit_blocks_after_limit"]:
    setattr(RateLimit, _n, None)                       # inherited tests run only in the main class


if __name__ == "__main__":
    unittest.main(verbosity=2, failfast=False)
