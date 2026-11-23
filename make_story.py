#!/usr/bin/env python3
"""Animated-scene reel (TikTok style): python3 make_story.py formats/<name>/config.json [--regen-vo] [--no-render]
One continuous Russian voice-over (ElevenLabs, with timestamps) drives word-by-word captions and scene cuts
(snapped to the 120 BPM music grid). Scenes are drawn in render_story.js. Output: out/invoyage_<name>.mp4"""
import base64, json, os, re, subprocess, sys

cfg_path = sys.argv[1]
C = json.load(open(cfg_path))
name, D_DIR = C["name"], os.path.dirname(cfg_path)
os.makedirs(f"{D_DIR}/audio", exist_ok=True)
os.makedirs("out/tmp/story", exist_ok=True)
beats = C["beats"]
texts = [b["text"] for b in beats]
full = " ".join(texts)

vo_mp3, vo_json = f"{D_DIR}/audio/vo.mp3", f"{D_DIR}/audio/vo_align.json"
if "--regen-vo" in sys.argv or not os.path.exists(vo_json):
    body = json.dumps({"text": full, "model_id": "eleven_multilingual_v2", "language_code": "ru",
                       "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.2, "speed": 1.03}})
    r = subprocess.run(["curl", "-sS", "-m", "120", "-X", "POST",
                        f"https://api.elevenlabs.io/v1/text-to-speech/{C['voice']}/with-timestamps",
                        "-H", "xi-api-key: dummy", "-H", "Content-Type: application/json", "-d", body],
                       capture_output=True, text=True)
    d = json.loads(r.stdout)
    open(vo_mp3, "wb").write(base64.b64decode(d["audio_base64"]))
    json.dump(d["alignment"], open(vo_json, "w"))
al = json.load(open(vo_json))
chars, cs, ce = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
assert "".join(chars) == full, "alignment text mismatch"
vo_dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vo_mp3],
                              capture_output=True, text=True).stdout)
OFF = C.get("vo_delay", 0.25)

bounds, pos = [], 0
for tx in texts:
    bounds.append((pos, pos + len(tx)))
    pos += len(tx) + 1
words, first = [], {}
for m in re.finditer(r"\S+", full):
    a, b = m.span()
    disp = re.sub(r"[.,!?—–:-]+", "", m.group())
    bi = next(i for i, (x, y) in enumerate(bounds) if x <= a < y)
    if disp:
        first.setdefault(bi, cs[a] + OFF)
        words.append({"t0": round(cs[a] + OFF, 3), "t1": round(ce[b - 1] + OFF, 3), "text": disp, "bi": bi})
nb = len(beats)
snap = lambda t: round(t * 2) / 2 if abs(t - round(t * 2) / 2) <= 0.2 else t
E = snap(first[nb - 1] - 0.3)
starts = [0.0] + [snap(first[i] - 0.12) for i in range(1, nb - 1)] + [E]
D = round(max(E + 4.0, vo_dur + OFF + 0.8), 2)

TL = {"duration": D, "words": words, "beats": [], "bigs": [], "titles": [], "emojis": [], "stamps": [],
      "end": {"t0": E, "tag": C.get("end_tag", "Подписывайся")}}
hud = []
last_stamp = 0
for i, b in enumerate(beats[:-1]):
    t0, t1 = starts[i], starts[i + 1]
    be = {"scene": b["scene"], "t0": t0, "t1": t1 if i < nb - 2 else D}
    if "tip" in b:
        be["tip"] = b["tip"]
    if "temp" in b:
        be["temp"] = b["temp"]
    if "cues" in b:
        be["cues"] = {}
        for k, wd in b["cues"].items():
            w = next(w for w in words if w["bi"] == i and w["text"].lower() == wd)
            be["cues"][k] = {"t0": round(w["t0"] - t0, 3), "t1": round(w["t1"] - t0, 3)}
    TL["beats"].append(be)
    if "big" in b:
        TL["bigs"].append({**b["big"], "t0": t0, "t1": t1})
    if "title" in b:
        TL["titles"].append({"text": b["title"], "t0": t0 + 0.95, "t1": t1})
    if "stamp" in b:
        TL["stamps"].append({**b["stamp"], "t0": t0 + 0.02})
        hud.append(t0)
        last_stamp = i
    for em in b.get("emoji", []):
        TL["emojis"].append({**em, "t0": t0 + em["at"], "t1": t1})
TL["hud"] = {"t0": hud[0], "t1": TL["beats"][last_stamp]["t1"],
             "starts": hud, "labels": C.get("hud_labels", ["Мальдивы", "Мальдивы", "Сингапур", "Швеция"])}
json.dump(TL, open("out/tmp/story/timeline.json", "w"), ensure_ascii=False, indent=1)
print("beats:", [(b["scene"], round(b["t0"], 2)) for b in TL["beats"]], "end", E, "dur", D)

mp = f"{D_DIR}/music_cfg.json"
json.dump({"duration": D, "stamps": [round(t - 0.0, 2) for t in hud], "music_params": {"end_at": E, "lift": [hud[0], starts[last_stamp + 1]], "thin_from": 999}}, open(mp, "w"))
subprocess.run(["python3", "make_music2.py", mp, f"{D_DIR}/music.wav"], check=True)

silent = f"out/tmp/story/{name}_silent.mp4"
if "--no-render" not in sys.argv:
    subprocess.run(["node", "render_story.js", "out/tmp/story/timeline.json", silent], check=True)
    out = f"out/invoyage_{name}.mp4"
    fc = (f"[2:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(OFF * 1000)}:all=1,apad=whole_dur={D},highpass=f=90,asplit[voa][vob];"
          f"[1:a]volume=0.55[mu];[mu][vob]sidechaincompress=threshold=0.02:ratio=5:attack=40:release=450[duck];"
          f"[duck][voa]amix=inputs=2:normalize=0[mix];[mix]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,afade=out:st={D - 1.2}:d=1.2[aout]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", silent, "-i", f"{D_DIR}/music.wav", "-i", vo_mp3, "-filter_complex", fc,
                    "-map", "0:v", "-map", "[aout]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-t", str(D),
                    "-movflags", "+faststart", out], check=True)
    print(out)
