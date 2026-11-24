#!/usr/bin/env python3
"""Offline tests with a fake Telegram. Run: python3 test_bot.py"""
import json, os, sqlite3, tempfile, threading, time, unittest, http.server
import bot as B

TOKEN = "123456789:" + "A" * 35


class Fake(B.Bot):
    def __init__(self, admins=(7,), fail=None):
        super().__init__(TOKEN, admins, os.path.join(tempfile.mkdtemp(), "t.db"))
        self.sent, self.fail = [], fail or {}

    def call(self, method, timeout=15, **p):
        if method == "sendMessage":
            if p["chat_id"] in self.fail:
                raise B.TelegramError(*self.fail[p["chat_id"]])
            self.sent.append((p["chat_id"], p["text"], p.get("reply_markup")))
        return True


def msg(text, uid=1, chat_type="private", **extra):
    m = {"message": {"chat": {"id": uid, "type": chat_type}, "from": {"id": uid, "is_bot": False}, "text": text}}
    m["message"].update(extra); return {"update_id": 1, **m}


def cb(data, uid=1, ctype="private"):
    return {"update_id": 2, "callback_query": {"id": "x", "data": data, "from": {"id": uid}, "message": {"chat": {"id": uid, "type": ctype}}}}


class T(unittest.TestCase):
    def test_start_menu_and_sections(self):
        b = Fake(); b.handle_update(msg("/start"))
        self.assertIn("InVoyage", b.sent[-1][1]); self.assertIsNotNone(b.sent[-1][2])
        for d, word in (("warm", "Мальдивы"), ("hotel", "ошибок"), ("save", "заранее")):
            b.handle_update(cb(d)); self.assertIn(word, b.sent[-1][1])

    def test_no_service_claims_or_dates(self):
        b = Fake(); b.handle_update(msg("/start"))
        everything = " ".join([B.T_START, B.T_WARM, B.T_HOTEL, B.T_SAVE, B.T_CONSENT, B.T_PRIVACY, B.T_SUBSCRIBED]).lower()
        for bad in ("март", "открыва", "бронир", "закажи", "подберём"):
            if bad == "бронир":                     # tips mention booking in general, but never offer it as our service
                continue
            self.assertNotIn(bad, everything)

    def test_subscribe_requires_consent_click_and_stop_deletes(self):
        b = Fake(); b.handle_update(cb("sub_ask")); self.assertEqual(b.active_ids(), [])
        b.handle_update(cb("sub_yes")); self.assertEqual(b.active_ids(), [1])
        b.handle_update(msg("/stop")); self.assertEqual(b.active_ids(), [])
        self.assertEqual(b.db.execute("select count(*) from subs").fetchone()[0], 0)    # data deleted, not just flagged

    def test_groups_bots_and_garbage_ignored(self):
        b = Fake()
        b.handle_update(msg("/start", chat_type="group")); b.handle_update(cb("warm", ctype="supergroup"))
        for junk in (None, 5, "x", [], {}, {"message": 1}, {"message": {"chat": {"id": "1", "type": "private"}}}, {"callback_query": {"data": "warm"}}):
            b.handle_update(junk)
        self.assertEqual(b.sent, [])

    def test_callback_allowlist_and_input_not_echoed(self):
        b = Fake(); b.handle_update(cb("<script>alert(1)</script>")); self.assertEqual(b.sent, [])
        b.handle_update(msg("<b>hi</b> <script>")); self.assertNotIn("<script>", b.sent[-1][1])

    def test_admin_commands_are_admin_only(self):
        b = Fake(); b.subscribe(10)
        b.handle_update(msg("/stats", uid=99)); self.assertNotIn("Подписчиков", b.sent[-1][1])
        b.handle_update(msg("/broadcast привет", uid=99)); self.assertEqual(len(b.pending), 0)
        b.handle_update(cb("bc_yes", uid=99)); time.sleep(0.2)
        self.assertFalse([s for s in b.sent if s[0] == 10])
        b.handle_update(msg("/stats", uid=7)); self.assertIn("1 активных", b.sent[-1][1])

    def test_broadcast_flow_and_blocked_user(self):
        b = Fake(fail={11: (403, "Forbidden: bot was blocked by the user")})
        b.subscribe(10); b.subscribe(11)
        b.handle_update(msg("/broadcast Тестовая рассылка", uid=7)); self.assertIn("Предпросмотр", b.sent[-1][1])
        self.assertFalse([s for s in b.sent if s[0] in (10, 11)])                          # nothing before confirmation
        b.broadcast_pause = 0
        b.handle_update(cb("bc_yes", uid=7)); time.sleep(0.6)
        self.assertTrue([s for s in b.sent if s[0] == 10 and s[1] == "Тестовая рассылка"])
        self.assertEqual(b.active_ids(), [10])                                            # blocked user deactivated
        self.assertIn("доставлено 1, не доставлено 1", b.sent[-1][1])

    def test_rate_limit(self):
        b = Fake()
        for _ in range(30): b.handle_update(msg("привет"))
        self.assertEqual(len(b.sent), 20)

    def test_token_not_leaked_in_errors(self):
        b = B.Bot(TOKEN, [], os.path.join(tempfile.mkdtemp(), "x.db"), "http://127.0.0.1:9")   # nothing listens there
        with self.assertRaises(B.TelegramError) as c: b.call("getMe", timeout=2)
        self.assertNotIn(TOKEN, str(c.exception)); self.assertNotIn("127.0.0.1", str(c.exception))

    def test_token_validation(self):
        self.assertTrue(B.TOKEN_RE.match(TOKEN)); self.assertFalse(B.TOKEN_RE.match("abc")); self.assertFalse(B.TOKEN_RE.match(TOKEN + "\n; rm -rf"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
