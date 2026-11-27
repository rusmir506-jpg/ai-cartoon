#!/usr/bin/env python3
"""Сведение звука серии 1: голос + мрачный фон (≈ −19 дБ к голосу) + редкие CC0-эффекты.
Запуск: python3 -I ep01/sound/mix.py  → ep01/sound/mix_raw.wav (до нормализации громкости)."""
import json, subprocess, re, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
SR, DUR = 48000, 78.0
N = int(SR * DUR)
CC0 = os.path.join(HERE, 'cc0')

def dec(name, af=None, ss=0.0, t=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss)]
    if t: cmd += ['-t', str(t)]
    cmd += ['-i', name if os.path.isabs(name) else os.path.join(CC0, name + '.mp3'), '-ac', '1', '-ar', str(SR)]
    if af: cmd += ['-af', af]
    cmd += ['-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).astype(np.float64)

def lufs(x):
    p = os.path.join(HERE, '_tmp.wav')
    write(p, x)
    out = subprocess.run(['ffmpeg', '-nostats', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    os.remove(p)
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])

def write(p, x):
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', p], input=st.astype(np.float64).tobytes())

def env(points):
    """огибающая громкости по точкам [(сек, множитель), ...]"""
    t = np.arange(N) / SR
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

def place(track, clip, at, gain=1.0, fade_in=0.02, fade_out=0.15):
    clip = clip.copy()
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi: clip[:fi] *= np.linspace(0, 1, fi)
    if fo and fo < len(clip): clip[-fo:] *= np.linspace(1, 0, fo)
    a = int(at * SR); b = min(N, a + len(clip))
    track[a:b] += clip[:b - a] * gain

def loop_to(x, n, xf=2.0):
    """зациклить клип с перекрёстным затуханием"""
    k = int(xf * SR); out = x.copy()
    while len(out) < n:
        ramp = np.linspace(0, 1, k)
        out[-k:] = out[-k:] * (1 - ramp) + x[:k] * ramp
        out = np.concatenate([out, x[k:]])
    return out[:n]

# --- тайминг слов ---
W = json.load(open(os.path.join(EP, 'voice', 'words.json')))
lines = {}
for w in W: lines.setdefault(w['line'] + 1, []).append(w)
ws = lambda n, k: lines[n][k]['s']
lineS = lambda n: lines[n][0]['s']
lineE = lambda n: lines[n][-1]['e']
cut = lambda n: 0 if n == 1 else (lineE(18) + 0.7 if n > 18 else max(lineE(n - 1) + 0.05, lineS(n) - 0.3))
END_CARD = cut(19)

# --- голос ---
voice = np.zeros(N); v = dec(os.path.join(EP, 'voice', 'voice.mp3')); voice[:len(v)] = v[:N]

# --- фон: тёмный дрон + гул салона (только на борту, без голосов — срезаем всё выше 300 Гц) ---
drone = loop_to(dec('drone', af='lowpass=f=1800'), N)
cabin = np.zeros(N); c = dec('cabin', af='lowpass=f=300,lowpass=f=300', ss=20, t=DUR); cabin[:len(c)] = c[:N]
board = env([(0, 1), (cut(2) - 0.05, 1), (cut(2), 0), (cut(5) - 0.05, 0), (cut(5), 1), (END_CARD, 1), (END_CARD + 0.01, 0), (DUR, 0)])
bed = drone * 0.55 + cabin * 1.6 * board
# тишина большого города: фон проваливается на строке 9, растёт к руке, обрывается на титре
bed *= env([(0, 0), (0.6, 1), (cut(9), 1), (cut(9) + 0.8, 0.35), (lineE(9), 0.35), (lineE(9) + 0.8, 1),
            (ws(18, 0), 1), (lineE(18), 1.8), (END_CARD, 1.8), (END_CARD + 0.02, 0.5), (DUR - 0.5, 0.4), (DUR, 0)])
# фон ровно на 19 дБ тише голоса
bed *= 10 ** ((lufs(voice) - 19 - lufs(bed)) / 20)

# --- эффекты (редкие, тихие) ---
fx = np.zeros(N)
chime = dec('chime', t=1.6);          place(fx, chime, 0.35, 0.35)
steps = dec('steps', ss=1.7, t=2.6);  place(fx, steps, cut(5) + 0.1, 0.5, 0.05, 0.6)
handle = dec('handle', ss=1.7, t=0.8); place(fx, handle, ws(7, 2) - 0.05, 0.35, 0.01, 0.2)
wind = dec('wind', af='lowpass=f=2500'); place(fx, wind, cut(8) + 0.1, 0.22, 1.2, 3.0)
static = dec('static', af='highpass=f=500');
place(fx, static[:int(0.35 * SR)], ws(10, 3) - 0.05, 0.9, 0.005, 0.1)           # щелчок рации
radio = 'highpass=f=350,lowpass=f=2800,acompressor=threshold=0.1:ratio=6'
breath = loop_to(dec('breath', af=radio, ss=0.3, t=6.3), int(10 * SR), 0.3)
b1 = breath[:int((cut(12) - ws(11, 4) + 0.2) * SR)]
place(fx, b1, ws(11, 4) - 0.25, 0.5, 0.3, 0.6)                                  # чужое дыхание
place(fx, loop_to(static, len(b1), 0.3), ws(11, 4) - 0.25, 0.25, 0.3, 0.6)
b2 = breath[int(2 * SR):int((2 + ws(16, 1) - cut(15)) * SR)]
place(fx, b2, cut(15), 0.4, 0.4, 0.01)                                          # дыхание до «замолкает» — обрыв
place(fx, loop_to(static, len(b2), 0.3), cut(15), 0.2, 0.4, 0.01)
place(fx, static[:int(0.2 * SR)], ws(16, 1), 0.9, 0.003, 0.08)                  # щелчок — тишина
hatch = dec('hatch', ss=0.55, t=4.0); place(fx, hatch, ws(17, 0) - 0.15, 0.45, 0.01, 0.8)
place(fx, static[:int(0.25 * SR)], END_CARD, 0.7, 0.003, 0.1)                   # обрыв в чёрное
fx *= 10 ** ((lufs(voice) - 11 - lufs(fx)) / 20)

mix = voice + bed + fx
mix *= 0.5 / np.max(np.abs(mix))
write(os.path.join(HERE, 'mix_raw.wav'), mix)
write(os.path.join(HERE, 'stem_bed.wav'), bed)
print('voice LUFS', round(lufs(voice), 1), '| bed LUFS', round(lufs(bed), 1), '| fx LUFS', round(lufs(fx), 1))
