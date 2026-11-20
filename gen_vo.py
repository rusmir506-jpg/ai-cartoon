#!/usr/bin/env python3
"""Generates hotels/<name>/audio/vo1..7.mp3 from config.json (ElevenLabs, Russian female voice).
A line "@reuse <path>" copies an existing file (e.g. the shared 'Новый отель каждую среду' sign-off)."""
import json, subprocess, sys, shutil, os
cfg_path = sys.argv[1]
cfg = json.load(open(cfg_path))
out = os.path.join(os.path.dirname(cfg_path), "audio")
os.makedirs(out, exist_ok=True)
only = {int(a) for a in sys.argv[2:]}      # optional: regenerate just these line numbers
for i, line in enumerate(cfg["vo"], 1):
    if only and i not in only:
        continue
    dst = f"{out}/vo{i}.mp3"
    if line.startswith("@reuse "):
        shutil.copy(line.split(" ", 1)[1], dst)
    else:
        body = json.dumps({"text": line, "model_id": "eleven_multilingual_v2", "language_code": "ru",
                           "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "speed": 0.95}})
        subprocess.run(["curl", "-sS", "-m", "60", "-X", "POST",
                        "https://api.elevenlabs.io/v1/text-to-speech/pFZP5JQG7iQjIQuC4Bku",
                        "-H", "xi-api-key: dummy", "-H", "Content-Type: application/json", "-d", body,
                        "-o", dst], check=True)
    d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst],
                       capture_output=True, text=True).stdout.strip()
    print(f"vo{i} {d or 'ERROR'}s  {line}")
