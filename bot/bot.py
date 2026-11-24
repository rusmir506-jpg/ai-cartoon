#!/usr/bin/env python3
"""InVoyage Telegram bot (long polling, standard library only).

Sections: warm destinations for December, 5 hotel-booking mistakes, 3 money-saving tips, opt-in waitlist.
Owner commands (ADMIN_IDS only): /stats and /broadcast <text> (preview + confirm button, opt-in subscribers only).

Safety: token only from the environment and redacted from logs; private chats only; per-user rate limit; callback
data allow-list; text input never echoed back; SQLite with parameters; stores only chat id + consent time;
broadcast sent as plain text, throttled, blocked users deactivated; no public port is opened (long polling).
"""
import json, os, re, sys, threading, time, urllib.error, urllib.request
import sqlite3
from collections import defaultdict, deque
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TOKEN_RE = re.compile(r"^\d{6,12}:[A-Za-z0-9_-]{30,50}$")

MENU = {"inline_keyboard": [
    [{"text": "Где тепло в декабре", "callback_data": "warm"}],
    [{"text": "5 ошибок при выборе отеля", "callback_data": "hotel"}],
    [{"text": "Как сэкономить на отдыхе", "callback_data": "save"}],
    [{"text": "Узнать первыми", "callback_data": "sub_ask"}]]}
BACK = {"inline_keyboard": [[{"text": "В меню", "callback_data": "menu"}]]}

T_START = ("Здравствуйте! Это InVoyage, агентство люксовых путешествий.\n\n"
           "Мы готовимся к запуску. Пока делимся подборками и советами: выберите раздел ниже. "
           "Чтобы узнать о новостях первыми, нажмите «Узнать первыми».")
T_WARM = ("Где тепло в декабре (днём, вода):\n\n"
          "Мальдивы: около +30°, вода +28°\nПхукет, Таиланд: до +32°, вода +28°\n"
          "Шри-Ланка, юг и запад: около +30°, вода +28°\nДубай: около +26°, вода +25°\n\n"
          "Подешевле:\nФукуок, Вьетнам: до +30°, вода +28°, сухой сезон\n"
          "Гоа, Индия: около +32°, вода +28°, пик сезона, людно\n"
          "Шарм-эль-Шейх, Египет: около +22°, зато вода +25°\n"
          "Кох Ронг, Камбоджа: около +28°, вода +29°, спокойное море\n\n"
          "Цифры усреднённые, по климатическим данным.")
T_HOTEL = ("5 ошибок при выборе отеля:\n\n"
           "1. Смотреть только на цену. Проверьте, что в неё входит: завтрак, трансфер, налоги и сборы.\n"
           "2. Верить только фото. Читайте свежие отзывы за последние 2–3 месяца.\n"
           "3. Не учитывать сезон. Дожди, волны и водоросли зависят от месяца.\n"
           "4. Путать «рядом с пляжем» и «на пляже». Смотрите на карте расстояние до воды и вход в море.\n"
           "5. Не читать условия отмены. Бесплатная отмена есть не у всех тарифов.")
T_SAVE = ("Как сэкономить на отдыхе:\n\n"
          "1. Бронируйте заранее: в высокий сезон цены растут.\n"
          "2. Считайте цену вместе с перелётом: дешёвый отель не всегда дешёвая поездка.\n"
          "3. Смотрите, что входит в цену: завтрак, трансфер, налоги и сборы.")
T_CONSENT = ("Нажимая «Согласен(на)», вы разрешаете хранить ваш идентификатор в Telegram и писать вам в этом боте "
             "о запуске и новостях InVoyage. Отписаться можно в любой момент командой /stop. Подробнее: /privacy")
T_PRIVACY = ("Что хранит бот: только ваш идентификатор в Telegram и время согласия, если вы подписались. "
             "Тексты ваших сообщений не сохраняются. Данные не передаются третьим лицам. "
             "Отписаться и удалить данные: команда /stop.")
T_SUBSCRIBED = "Готово! Мы напишем вам, как только всё будет готово. Отписаться можно командой /stop."
T_STOPPED = "Вы отписались, данные удалены. Если захотите вернуться, нажмите «Узнать первыми» в меню (/menu)."
T_UNKNOWN = "Выберите раздел в меню:"
ALLOWED_CB = {"menu", "warm", "hotel", "save", "sub_ask", "sub_yes", "sub_no", "bc_yes", "bc_no"}
COMMANDS = [{"command": "menu", "description": "Меню"}, {"command": "privacy", "description": "Какие данные хранит бот"},
            {"command": "stop", "description": "Отписаться и удалить данные"}]


class TelegramError(Exception):
    def __init__(self, code, description, retry_after=0):
        super().__init__(f"{code} {description}")
        self.code, self.retry_after = code, retry_after


class Bot:
    def __init__(self, token, admins, db_path, api_base="https://api.telegram.org"):
        self.token, self.admins, self.api_base = token, set(admins), api_base.rstrip("/")
        self.db = sqlite3.connect(db_path, check_same_thread=False)
        self.db.execute("CREATE TABLE IF NOT EXISTS subs (chat_id INTEGER PRIMARY KEY, consent_at INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1)")
        self.db.commit()
        self.lock = threading.Lock()
        self.hits = defaultdict(deque)
        self.pending = {}                                  # admin id -> (text, expires)

    # -- telegram io ----------------------------------------------------------
    def call(self, method, timeout=15, **params):
        req = urllib.request.Request(f"{self.api_base}/bot{self.token}/{method}", json.dumps(params).encode(),
                                     {"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                data = json.loads(r.read())
        except urllib.error.HTTPError as e:
            try:
                data = json.loads(e.read())
            except ValueError:
                data = {"error_code": e.code, "description": "http error"}
        except (urllib.error.URLError, OSError, ValueError) as e:
            raise TelegramError(0, type(e).__name__)       # never include the URL (it contains the token)
        if not data.get("ok"):
            raise TelegramError(data.get("error_code", 0), str(data.get("description", ""))[:100],
                                (data.get("parameters") or {}).get("retry_after", 0))
        return data.get("result")

    def send(self, chat_id, text, kb=None):
        p = {"chat_id": chat_id, "text": text, "disable_web_page_preview": True}
        if kb:
            p["reply_markup"] = kb
        return self.call("sendMessage", **p)

    # -- helpers -----------------------------------------------------------------
    def allow(self, uid, limit=20, window=60):
        now, q = time.time(), self.hits[uid]
        while q and q[0] <= now - window:
            q.popleft()
        if len(q) >= limit:
            return False
        q.append(now)
        return True

    def subscribe(self, chat_id):
        with self.lock:
            self.db.execute("INSERT INTO subs (chat_id, consent_at, active) VALUES (?,?,1) ON CONFLICT(chat_id) DO UPDATE SET active=1, consent_at=excluded.consent_at",
                            (chat_id, int(time.time())))
            self.db.commit()

    def unsubscribe(self, chat_id):
        with self.lock:
            self.db.execute("DELETE FROM subs WHERE chat_id=?", (chat_id,))
            self.db.commit()

    def deactivate(self, chat_id):
        with self.lock:
            self.db.execute("UPDATE subs SET active=0 WHERE chat_id=?", (chat_id,))
            self.db.commit()

    def active_ids(self):
        with self.lock:
            return [r[0] for r in self.db.execute("SELECT chat_id FROM subs WHERE active=1")]

    # -- updates -----------------------------------------------------------------
    def handle_update(self, u):
        if not isinstance(u, dict):
            return
        if isinstance(u.get("callback_query"), dict):
            return self.on_callback(u["callback_query"])
        msg = u.get("message")
        if not isinstance(msg, dict):
            return
        chat, user = msg.get("chat") or {}, msg.get("from") or {}
        cid, uid = chat.get("id"), user.get("id")
        if chat.get("type") != "private" or not isinstance(cid, int) or not isinstance(uid, int) or user.get("is_bot"):
            return
        if not self.allow(uid):
            return
        text = msg.get("text")
        if not isinstance(text, str):
            return self.send(cid, "Я понимаю только текст. " + T_UNKNOWN, MENU)
        text = text.strip()[:4000]
        cmd = text.split()[0].split("@")[0].lower() if text.startswith("/") else ""
        if cmd in ("/start", "/menu"):
            return self.send(cid, T_START, MENU)
        if cmd == "/privacy":
            return self.send(cid, T_PRIVACY, BACK)
        if cmd == "/stop":
            self.unsubscribe(cid)
            return self.send(cid, T_STOPPED, BACK)
        if cmd == "/subscribe":
            return self.send(cid, T_CONSENT, self.consent_kb())
        if cmd == "/stats" and uid in self.admins:
            with self.lock:
                a = self.db.execute("SELECT count(*) FROM subs WHERE active=1").fetchone()[0]
                t = self.db.execute("SELECT count(*) FROM subs").fetchone()[0]
            return self.send(cid, f"Подписчиков: {a} активных, {t} всего.")
        if cmd == "/broadcast" and uid in self.admins:
            body = text.split(None, 1)[1].strip() if len(text.split(None, 1)) > 1 else ""
            if not body or len(body) > 3500:
                return self.send(cid, "Напишите так: /broadcast текст рассылки (до 3500 символов).")
            self.pending[uid] = (body, time.time() + 600)
            n = len(self.active_ids())
            kb = {"inline_keyboard": [[{"text": f"Отправить {n} подписчикам", "callback_data": "bc_yes"}, {"text": "Отмена", "callback_data": "bc_no"}]]}
            return self.send(cid, "Предпросмотр рассылки:\n\n" + body, kb)
        self.send(cid, T_UNKNOWN, MENU)

    def consent_kb(self):
        return {"inline_keyboard": [[{"text": "Согласен(на)", "callback_data": "sub_yes"}, {"text": "Нет", "callback_data": "sub_no"}]]}

    def on_callback(self, cb):
        data, user = cb.get("data"), cb.get("from") or {}
        uid = user.get("id")
        msg = cb.get("message") or {}
        cid = (msg.get("chat") or {}).get("id")
        try:
            self.call("answerCallbackQuery", callback_query_id=str(cb.get("id", ""))[:64])
        except TelegramError:
            pass
        if data not in ALLOWED_CB or not isinstance(cid, int) or not isinstance(uid, int) or (msg.get("chat") or {}).get("type") != "private":
            return
        if not self.allow(uid):
            return
        if data == "menu":
            self.send(cid, T_START, MENU)
        elif data == "warm":
            self.send(cid, T_WARM, BACK)
        elif data == "hotel":
            self.send(cid, T_HOTEL, BACK)
        elif data == "save":
            self.send(cid, T_SAVE, BACK)
        elif data == "sub_ask":
            self.send(cid, T_CONSENT, self.consent_kb())
        elif data == "sub_yes":
            self.subscribe(cid)
            self.send(cid, T_SUBSCRIBED, BACK)
        elif data == "sub_no":
            self.send(cid, "Хорошо, ничего не сохраняю.", BACK)
        elif data in ("bc_yes", "bc_no") and uid in self.admins:
            item = self.pending.pop(uid, None)
            if data == "bc_no" or not item or item[1] < time.time():
                return self.send(cid, "Рассылка отменена или устарела.")
            threading.Thread(target=self.broadcast, args=(cid, item[0]), daemon=True).start()

    def broadcast(self, admin_chat, text, pause=0.06):
        ok = fail = 0
        for chat_id in self.active_ids():
            for attempt in range(2):
                try:
                    self.send(chat_id, text)
                    ok += 1
                    break
                except TelegramError as e:
                    if e.code == 429 and attempt == 0:
                        time.sleep(min(e.retry_after or 1, 30))
                        continue
                    fail += 1
                    if e.code in (400, 403):                 # blocked the bot / chat gone: stop writing to them
                        self.deactivate(chat_id)
                    break
            time.sleep(pause)
        try:
            self.send(admin_chat, f"Рассылка завершена: доставлено {ok}, не доставлено {fail}.")
        except TelegramError:
            pass

    def run(self):
        offset = 0
        try:
            self.call("setMyCommands", commands=COMMANDS)
        except TelegramError:
            pass
        delay = 1
        while True:
            try:
                updates = self.call("getUpdates", timeout=45, offset=offset, allowed_updates=["message", "callback_query"])
                delay = 1
                for u in updates:
                    offset = max(offset, u.get("update_id", 0) + 1)
                    try:
                        self.handle_update(u)
                    except TelegramError as e:
                        print("send error", e, file=sys.stderr)
                    except Exception as e:                      # one bad update must never stop the bot
                        print("update error", type(e).__name__, file=sys.stderr)
            except TelegramError as e:
                print("poll error", e, file=sys.stderr)
                time.sleep(delay)
                delay = min(delay * 2, 60)


def main():
    token = os.environ.get("BOT_TOKEN", "")
    if not TOKEN_RE.match(token):
        sys.exit("BOT_TOKEN is missing or malformed (get it from @BotFather and put it in .env)")
    admins = [int(x) for x in os.environ.get("ADMIN_IDS", "").split(",") if x.strip().isdigit()]
    data = Path(os.environ.get("DATA_DIR", ROOT / "data")); data.mkdir(mode=0o700, parents=True, exist_ok=True)
    print(f"bot started, admins: {len(admins)}", file=sys.stderr)
    Bot(token, admins, data / "bot.db", os.environ.get("TELEGRAM_API", "https://api.telegram.org")).run()


if __name__ == "__main__":
    main()
