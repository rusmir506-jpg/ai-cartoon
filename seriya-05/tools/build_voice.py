#!/usr/bin/env python3
"""Собирает финальную озвучку из сырого файла ElevenLabs:
заплатки на отдельные слова -> драматические паузы -> ускорение -> тайминг слов.
Запуск из папки серии: python3 tools/build_voice.py"""
import json, subprocess, wave, tempfile, os
import numpy as np

SR = 44100
TEMPO = 1.14
# паузы: (после какого слова по счёту с конца текста искать — задаём текстом, длина сек)
PAUSES = [("ней.", 0.6), ("тишина.", 1.5), ("птицы.", 0.6), ("отпускала.", 0.4), ("сказали.", 0.8)]
# заплатки: (первое слово, сколько слов, файл, подгонять ли длину под исходную)
import sys
# заглушить артефакты в паузах (секунды финальной дорожки)
MUTES = []
import sys
PB = sys.argv[1] if len(sys.argv) > 1 else "s1"   # «пол бака»: s1 — дубль, утверждённый в серии 1; pol — «Половина бака»
PATCHES = [("Я#2", 6, "audio/patch/k1-b", True), ("Машина#1", 4, "audio/patch/k2-b", True), ("Пол#1", 2, "audio/patch/pb-" + PB, True)]

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

for target, n, base, fit in PATCHES:
    word, occ = (target.split("#") + ["1"])[:2]
    i = [k for k, w in enumerate(words) if w[0] == word][int(occ) - 1]
    j = i + n - 1
    c1 = (words[i - 1][2] + words[i][1]) / 2
    c2 = (words[j][2] + words[j + 1][1]) / 2
    al = json.load(open(base + ".json")); p = load(base + ".mp3")
    pw = words_of(al)
    ps, pe = pw[0][1], pw[-1][2]
    a, b = max(0, ps - 0.12), min(len(p) / SR, pe + 0.2)
    seg = p[int(a * SR):int(b * SR)]
    k = 1.0
    if fit:  # растягиваем/сжимаем заплатку ровно под исходное место, чтобы тайминг дальше не поехал
        k = (b - a) / (c2 - c1)
        tmp1, tmp2 = tempfile.mktemp(suffix=".wav"), tempfile.mktemp(suffix=".wav")
        o = wave.open(tmp1, "w"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(seg.astype(np.int16).tobytes()); o.close()
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp1, "-af", f"atempo={k}", tmp2], check=True)
        seg = load(tmp2); os.remove(tmp1); os.remove(tmp2)
        want = int(c2 * SR) - int(c1 * SR)
        seg = seg[:want] if len(seg) >= want else np.concatenate([seg, np.zeros(want - len(seg), np.float32)])
        print("заплатка", base, "темп", round(k, 3))
    seg = fade(seg)
    x = np.concatenate([fade(x[:int(c1 * SR)]), seg, fade(x[int(c2 * SR):])])
    delta = len(seg) / SR - (c2 - c1)
    if len(pw) == n:
        for q in range(n): words[i + q][0], words[i + q][1], words[i + q][2] = pw[q][0], c1 + (pw[q][1] - a) / k, c1 + (pw[q][2] - a) / k
    else:
        words[i][1], words[j][2] = c1 + (ps - a) / k, c1 + (pe - a) / k
    for w in words[j + 1:]: w[1] += delta; w[2] += delta

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
if MUTES:
    g = load("audio/golos-final.wav")
    sr2 = 44100
    for a, b in MUTES:
        i0, i1 = int(a * sr2), int(b * sr2); n = int(0.01 * sr2)
        g[i0 - n:i0] *= np.linspace(1, 0, n); g[i0:i1] = 0; g[i1:i1 + n] *= np.linspace(0, 1, n)
    tmpm = tempfile.mktemp(suffix=".wav")
    o = wave.open(tmpm, "w"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr2); o.writeframes(np.clip(g, -32768, 32767).astype(np.int16).tobytes()); o.close()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmpm, "-ar", "48000", "audio/golos-final.wav"], check=True); os.remove(tmpm)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/golos-final.wav", "-b:a", "160k", "audio/golos-final.mp3"], check=True)
os.remove(tmp)

remap = lambda t: round((t + sum(d for c, d in ins if t >= c)) / TEMPO, 3)
out = [{"w": w.replace("́", ""), "s": remap(s), "e": remap(e)} for w, s, e in words]
json.dump(out, open("audio/slova.json", "w"), ensure_ascii=False, indent=0)
open("audio/slova.js", "w", encoding="utf-8").write("window.SLOVA=" + json.dumps(out, ensure_ascii=False) + ";\n")
print("слов:", len(out), "| длина:", round(len(y) / SR / TEMPO, 2), "c | конец:", out[-1])
