#!/usr/bin/env python3
"""Собирает финальную озвучку из сырого файла ElevenLabs:
заплатки на отдельные слова -> драматические паузы -> ускорение -> тайминг слов.
Запуск из папки серии: python3 tools/build_voice.py"""
import json, subprocess, wave, tempfile, os
import numpy as np

SR = 44100
TEMPO = 1.14
# паузы: (после какого слова по счёту с конца текста искать — задаём текстом, длина сек)
PAUSES = [("сбили».", 0.7), ("разом.", 0.5), ("свет.", 1.3)]
# заплатки: слово в тексте -> файл с перезаписанным словом
PATCHES = [("Полбака.", "audio/patch/polbaka-g")]

def load(path):
    tmp = tempfile.mktemp(suffix=".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", path, "-ac", "1", "-ar", str(SR), tmp], check=True)
    w = wave.open(tmp); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32); w.close(); os.remove(tmp)
    return x

def words_of(al):
    out, cur, s, pe = [], "", None, None
    for c, b, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if c.isspace():
            if cur: out.append([cur, b if s is None else s, pe]); cur = ""; s = None
        else:
            if not cur: s = b
            cur += c; pe = e
    if cur: out.append([cur, s, pe])
    return out

def fade(seg, n=int(0.004 * SR)):
    seg = seg.copy(); seg[:n] *= np.linspace(0, 1, n); seg[-n:] *= np.linspace(1, 0, n); return seg

x = load("audio/golos.mp3")
words = words_of(json.load(open("audio/golos-simvoly.json")))

for target, base in PATCHES:
    i = next(k for k, w in enumerate(words) if w[0] == target)
    c1 = (words[i - 1][2] + words[i][1]) / 2
    c2 = (words[i][2] + words[i + 1][1]) / 2
    al = json.load(open(base + ".json")); p = load(base + ".mp3")
    letters = [(b, e) for c, b, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]) if c.isalpha()]
    ps, pe = letters[0][0], letters[-1][1]
    a, b = max(0, ps - 0.15), min(len(p) / SR, pe + 0.22)
    seg = fade(p[int(a * SR):int(b * SR)])
    x = np.concatenate([fade(x[:int(c1 * SR)]), seg, fade(x[int(c2 * SR):])])
    delta = (b - a) - (c2 - c1)
    words[i][1], words[i][2] = c1 + (ps - a), c1 + (pe - a)
    for w in words[i + 1:]: w[1] += delta; w[2] += delta

ins = []
for target, d in PAUSES:
    i = max(k for k, w in enumerate(words) if w[0] == target)
    ins.append(((words[i][2] + words[i + 1][1]) / 2, d))
parts, prev = [], 0
for t, d in ins:
    parts += [fade(x[prev:int(t * SR)]), np.zeros(int(d * SR), np.float32)]; prev = int(t * SR)
parts.append(fade(x[prev:]))
y = np.clip(np.concatenate(parts), -32768, 32767).astype(np.int16)
tmp = tempfile.mktemp(suffix=".wav")
o = wave.open(tmp, "w"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(y.tobytes()); o.close()
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"atempo={TEMPO}", "-ar", "48000", "audio/golos-final.wav"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/golos-final.wav", "-b:a", "160k", "audio/golos-final.mp3"], check=True)
os.remove(tmp)

remap = lambda t: round((t + sum(d for c, d in ins if t >= c)) / TEMPO, 3)
out = [{"w": w.replace("́", ""), "s": remap(s), "e": remap(e)} for w, s, e in words]
json.dump(out, open("audio/slova.json", "w"), ensure_ascii=False, indent=0)
k = next(k for k, w in enumerate(out) if w["w"] == "Полбака.")
print("слов:", len(out), "| длина:", round(len(y) / SR / TEMPO, 2), "c | Полбака:", out[k], "| конец:", out[-1])
