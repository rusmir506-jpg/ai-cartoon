#!/usr/bin/env python3
"""Фон и эффекты серии 5 (финал). Всё синтезируется здесь кодом (numpy) — чужих записей нет.
Запуск из папки серии: python3 tools/make_sound.py  ->  audio/zvuk/fon.wav, audio/zvuk/effekty.wav"""
import numpy as np, wave, os

SR, DUR = 48000, 72.0
N = int(SR * DUR)
T = np.arange(N) / SR
rs = np.random.RandomState(7)

def env(points):
    """Огибающая по точкам (сек, уровень)."""
    xs, ys = zip(*points)
    return np.interp(T, xs, ys)

def band(noise, lo, hi):
    """Полосовой фильтр через БПФ."""
    F = np.fft.rfft(noise); fr = np.fft.rfftfreq(len(noise), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(fr, 1e-6)) ** 4) / (1 + (fr / hi) ** 4)
    return np.fft.irfft(F * m, len(noise))

def norm(x): return x / (np.abs(x).max() + 1e-9)

def place(buf, t, snd, gain=1.0, pan=0.0):
    i = int(t * SR); snd = snd[:max(0, N - i)]
    buf[i:i + len(snd), 0] += snd * gain * (1 - max(0, pan))
    buf[i:i + len(snd), 1] += snd * gain * (1 + min(0, pan))

def tone(f, d, decay=None, attack=0.004):
    t = np.arange(int(d * SR)) / SR
    e = np.minimum(1, t / attack) * (np.exp(-t / decay) if decay else np.minimum(1, (d - t) / 0.01))
    return np.sin(2 * np.pi * f * t) * e

def burst(d, lo, hi, decay):
    t = np.arange(int(d * SR)) / SR
    return norm(band(rs.randn(len(t)), lo, hi)) * np.exp(-t / decay) * np.minimum(1, t / 0.002)

# ---------------- ФОН ----------------
drone = np.zeros(N)
for f, a, lf in [(55, 1.0, .07), (55.6, .8, .05), (82.4, .5, .09), (110.3, .28, .11), (164.8, .10, .13)]:
    drone += a * np.sin(2 * np.pi * f * T + 2 * np.sin(2 * np.pi * lf * T)) * (0.8 + 0.2 * np.sin(2 * np.pi * lf * 0.6 * T + f))
rumble = norm(band(np.cumsum(rs.randn(N)), 30, 140))
drone = norm(drone) * 0.8 + rumble * 0.35
droneEnv = env([(0, 1.0), (19.7, .9), (28.4, 1.1), (44.5, 1.3), (53.6, 1.6), (53.7, 0), (DUR, 0)])
# финал: тёплый мажорный аккорд утром (тот же гул, но светлый: A-мажор)
chord = np.zeros(N)
for f, a in [(110, 1), (138.6, .6), (164.8, .7), (220, .4), (277.2, .25), (329.6, .3)]:
    chord += a * np.sin(2 * np.pi * f * T + .8 * np.sin(2 * np.pi * .1 * T))
chordEnv = env([(0, 0), (57.0, 0), (59.0, .9), (69.0, 1.0), (71.5, 0), (DUR, 0)])
w1 = norm(band(rs.randn(N), 250, 900)); w2 = norm(band(rs.randn(N), 500, 2200))
gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * T + 1) * np.sin(2 * np.pi * 0.31 * T)
windEnv = env([(0, .6), (9.9, .8), (19.7, .3), (40.5, .4), (46.4, 1.2), (53.5, 1.0), (53.7, 0), (57.1, 0), (58, .15), (DUR, .1)])
wind = (w1 * gust + w2 * (1 - gust) * .5) * windEnv
fon = np.stack([drone * droneEnv * .9 + norm(chord) * chordEnv * .7 + wind * .5, drone * droneEnv * .9 + norm(chord) * chordEnv * .7 + np.roll(wind, 4000) * .5], 1)

# ---------------- ЭФФЕКТЫ ----------------
fx = np.zeros((N, 2))
step = burst(.12, 60, 400, .03)
bt = np.arange(int(2.2 * SR)) / SR
# маячок пищит, пока он на Косте/в руках (до вспышки)
k = int(np.ceil(0.2 / .84))
while k * .84 < 53.6:
    if not (19.7 < k * .84 < 23.1): place(fx, k * .84, tone(2093, .07), .12, .2)
    k += 1
# бег Тёмы и Ани
for i in range(14): place(fx, 4.6 + i * .2, burst(.08, 150, 1200, .02), .25, .3)
for i in range(12): place(fx, 6.5 + i * .28, step, .4, -.2)
# часы 0:40
for i in range(10): place(fx, 14.9 + i * .5, burst(.02, 3000, 7000, .004), .4, -.1)
# связка ключей: звон (идёт), звон крупно
for i in range(8): place(fx, 17.5 + i * .27, tone(3100 + (i % 3) * 600, .25, .06), .2, .2)
for i, fq in enumerate([3100, 4200, 5300, 3700, 6100, 4700]): place(fx, 19.8 + i * .07, tone(fq, .6, .12), .35 - i * .03)
# поддела — скрежет, щёлк
place(fx, 23.6, burst(1.2, 1500, 5000, .5) * .6, .3)
place(fx, 25.95, burst(.04, 1500, 8000, .006), .9)
place(fx, 26.0, tone(1046, .3, .08), .2)
# машина из канавы: натуга, рывок
mt = np.arange(int(2.0 * SR)) / SR
ph = 2 * np.pi * np.cumsum(np.interp(mt, [0, 2], [40, 60])) / SR
place(fx, 32.4, norm(band(np.sin(ph) + .4 * np.sign(np.sin(ph)), 30, 420)) * np.sin(np.pi * mt / 2), .5)
place(fx, 33.9, np.sin(2 * np.pi * np.cumsum(np.interp(bt, [0, 2.2], [80, 30])) / SR) * np.exp(-bt / .3), .5)
# двигатель «последнего рейса»: салон и газ
et = np.arange(int(13.0 * SR)) / SR
rpm = np.interp(et, [0, 1, 6, 8.5, 9.0, 13], [30, 40, 50, 80, 85, 85])
ph = 2 * np.pi * np.cumsum(rpm) / SR
eng = norm(band(np.sin(ph) + .5 * np.sin(2 * ph + .5) + .3 * np.sin(3 * ph) + .2 * np.sign(np.sin(ph)), 30, 420)) * np.interp(et, [0, .3, 8.9, 9.1, 12.0, 13], [0, .8, 1, 1, .2, 0])
place(fx, 40.5, eng, .5)
# свист ракеты нарастает в зеркале и уходит за машиной
rt = np.arange(int(9.0 * SR)) / SR
place(fx, 44.5, (np.sin(2 * np.pi * np.cumsum(np.interp(rt, [0, 6, 9], [800, 1800, 1500])) / SR) * .5 + norm(band(rs.randn(len(rt)), 300, 3000)) * .5) * np.interp(rt, [0, 5, 8.9, 9], [0, 1, 1, 0]), .5, .3)
# прыжок в траву
place(fx, 48.95, burst(.5, 200, 3000, .15), .6, -.3)
# вспышка: далёкий тяжёлый удар, потом тишина
boom = np.sin(2 * np.pi * np.cumsum(np.interp(np.arange(int(3.5 * SR)) / SR, [0, 3.5], [55, 20])) / SR) * np.exp(-np.arange(int(3.5 * SR)) / SR / .9) + .6 * burst(3.5, 60, 1500, .6)
place(fx, 53.65, boom, 1.0)
# утро: птицы поют
r2 = np.random.RandomState(11)
def chirp(f0, f1, d):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR) * np.sin(np.pi * t / d) ** 2
t0 = 57.5
while t0 < 71:
    f0 = 3000 + r2.rand() * 2000
    for j in range(1 + r2.randint(3)):
        place(fx, t0 + j * .11, chirp(f0, f0 + r2.choice([-900, 900]), .08 + r2.rand() * .05), .13, r2.rand() * 1.6 - .8)
    t0 += .25 + r2.rand() * .6
# кепка: тёплый звон
place(fx, 60.0, tone(1318, 1.5, .6) + .6 * tone(1975, 1.5, .5), .15)

os.makedirs("audio/zvuk", exist_ok=True)
for name, x in (("fon", fon), ("effekty", fx)):
    x = x / np.abs(x).max() * 0.7
    w = wave.open(f"audio/zvuk/{name}.wav", "w"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
print("готово: audio/zvuk/fon.wav, audio/zvuk/effekty.wav")
