#!/usr/bin/env python3
"""Фон и эффекты серии 4. Всё синтезируется здесь кодом (numpy) — чужих записей нет.
Запуск из папки серии: python3 tools/make_sound.py  ->  audio/zvuk/fon.wav, audio/zvuk/effekty.wav"""
import numpy as np, wave, os

SR, DUR = 48000, 67.5
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
droneEnv = env([(0, .8), (25.6, 1.0), (29.9, .5), (39.8, .4), (42.5, .2), (45.4, .5), (52.9, 1.1), (62.2, 1.4), (65.45, 1.7), (65.55, 0), (DUR, 0)])
w1 = norm(band(rs.randn(N), 250, 900)); w2 = norm(band(rs.randn(N), 500, 2200))
gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * T + 1) * np.sin(2 * np.pi * 0.31 * T)
windEnv = env([(0, .3), (2.8, .6), (7.3, .6), (8.8, 1.5), (11.3, 1.2), (11.5, .2), (21.3, .6), (25.6, .3), (55.1, .4), (62.2, .8), (65.5, 0), (DUR, 0)])
wind = (w1 * gust + w2 * (1 - gust) * .5) * windEnv
fon = np.stack([drone * droneEnv * .9 + wind * .5, drone * droneEnv * .9 + np.roll(wind, 4000) * .5], 1)

# ---------------- ЭФФЕКТЫ ----------------
fx = np.zeros((N, 2))
step = burst(.12, 60, 400, .03)
bt = np.arange(int(2.2 * SR)) / SR
# двигатель: старт у элеватора и гонка через поле до канавы
et = np.arange(int(23.5 * SR)) / SR
rpm = np.interp(et, [0, .6, 1.6, 22.5, 23.4, 23.5], [24, 42, 64, 68, 30, 20])
ph = 2 * np.pi * np.cumsum(rpm) / SR
eng = norm(band(np.sin(ph) + .5 * np.sin(2 * ph + .5) + .3 * np.sin(3 * ph) + .2 * np.sign(np.sin(ph)), 30, 420)) * np.interp(et, [0, .1, .8, 7.3, 7.6, 11.3, 11.6, 21.3, 21.6, 23.3, 23.5], [0, .6, 1, 1, .5, .5, .3, .3, 1, 1, 0])
place(fx, .4, eng, .5)
# часы в начале
for i in range(5): place(fx, .1 + i * .5, burst(.02, 3000, 7000, .004), .4, -.1)
# тенты: хлопок ткани о капот
place(fx, 8.1, burst(.6, 200, 3000, .18), .6, .2)
place(fx, 8.3, burst(.4, 1500, 6000, .1), .3, -.2)
# телефон: полоски сети загораются (писки)
for i in range(4): place(fx, 12.5 + i * .3, tone(1760 + i * 220, .1), .2, .2)
# ракета меняет курс: свист и тревожный писк сигнала
mt = np.arange(int(2.8 * SR)) / SR
place(fx, 18.5, np.sin(2 * np.pi * np.cumsum(np.interp(mt, [0, 1, 1.6, 2.8], [1300, 1300, 900, 1100])) / SR) * np.sin(np.pi * mt / 2.8) ** 2, .2, .5)
for i in range(3): place(fx, 20.6 + i * .3, tone(987, .12), .2)
# канава: удар, скрежет; бег
place(fx, 23.35, np.sin(2 * np.pi * np.cumsum(np.interp(bt, [0, 2.2], [80, 30])) / SR) * np.exp(-bt / .35) + .6 * burst(2.2, 300, 4000, .2), .8)
for i in range(6): place(fx, 24.4 + i * .2, step, .35, .3 - i * .1)
# люк и скафандр: гул объекта
hh = np.arange(int(39.8 * SR)) / SR
place(fx, 25.6, (np.sin(2 * np.pi * 73 * hh) + .3 * np.sin(2 * np.pi * 146.5 * hh)) * np.minimum(1, hh / .5) * np.minimum(1, (39.8 - hh) / .1) * .7, .25)
# стекло шлема поднимается: пневматика
place(fx, 40.85, burst(.6, 1500, 7000, .2), .4)
place(fx, 41.0, tone(1318, .8, .3) + .5 * tone(1975, .8, .3), .15)
# Лена шагнула — шаг
place(fx, 43.4, step, .4, -.3); place(fx, 43.85, step, .35, -.3)
# маячок на груди: писк в ритме
k = int(np.ceil(49.1 / .84))
while k * .84 < 52.9:
    place(fx, k * .84, tone(2093, .08), .25); k += 1
# часы 1:00 — быстрые
for i in range(10): place(fx, 52.95 + i * .2, burst(.02, 3000, 7000, .004), .45, -.1)
# шаги Кости по траве; бег Тёмы
for i in range(6): place(fx, 56.5 + i * .55, burst(.18, 40, 300, .06), .5 - i * .06, .3)
for i in range(10): place(fx, 62.8 + i * .26, burst(.08, 150, 1200, .02), .3, -.1 + i * .05)
# ракета поворачивает: нарастающий свист
rt = np.arange(int(5.7 * SR)) / SR
place(fx, 59.8, (np.sin(2 * np.pi * np.cumsum(np.interp(rt, [0, 5.7], [700, 1700])) / SR) * .5 + norm(band(rs.randn(len(rt)), 300, 3000)) * .5) * (rt / 5.7) ** 1.5, .5, .3)
place(fx, 65.5, np.sin(2 * np.pi * np.cumsum(np.interp(bt, [0, 2.2], [60, 24])) / SR) * np.exp(-bt / .45), .9)

os.makedirs("audio/zvuk", exist_ok=True)
for name, x in (("fon", fon), ("effekty", fx)):
    x = x / np.abs(x).max() * 0.7
    w = wave.open(f"audio/zvuk/{name}.wav", "w"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
print("готово: audio/zvuk/fon.wav, audio/zvuk/effekty.wav")
