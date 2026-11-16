#!/usr/bin/env python3
"""Фон и эффекты серии 1. Всё синтезируется здесь кодом (numpy) — чужих записей нет.
Запуск из папки серии: python3 tools/make_sound.py  ->  audio/zvuk/fon.wav, audio/zvuk/effekty.wav"""
import numpy as np, wave, os

SR, DUR = 48000, 88.5
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
# мрачный ровный гул: низкие синусы с медленной расстройкой + коричневый шум
drone = np.zeros(N)
for f, a, lf in [(55, 1.0, .07), (55.6, .8, .05), (82.4, .5, .09), (110.3, .28, .11), (164.8, .10, .13)]:
    drone += a * np.sin(2 * np.pi * f * T + 2 * np.sin(2 * np.pi * lf * T)) * (0.8 + 0.2 * np.sin(2 * np.pi * lf * 0.6 * T + f))
rumble = norm(band(np.cumsum(rs.randn(N)), 30, 140))
drone = norm(drone) * 0.8 + rumble * 0.35
droneEnv = env([(0, 0), (1.5, 1), (78.4, 1), (80.0, .22), (82.1, .16), (86.55, 1.5), (86.65, 0), (DUR, 0)])
# горячий ветер: шум с плавающей полосой; сильнее на улице, стихает на «Ветер стих»
w1 = norm(band(rs.randn(N), 250, 900)); w2 = norm(band(rs.randn(N), 500, 2200))
gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * T + 1) * np.sin(2 * np.pi * 0.31 * T)
windEnv = env([(0, .6), (8.5, .7), (10.4, .25), (12.5, .6), (17.4, .2), (22.9, .7), (26.3, .05), (29.1, .25), (32.4, .1),
               (52, .1), (58.5, .9), (61.3, .9), (62.1, 1.3), (66, .8), (73.5, .7), (77.4, 1.1), (78.42, 1.0), (79.25, 0), (DUR, 0)])
wind = (w1 * gust + w2 * (1 - gust) * .5) * windEnv
fon = np.stack([drone * droneEnv * .9 + wind * .5, drone * droneEnv * .9 + np.roll(wind, 4000) * .5], 1)

# ---------------- ЭФФЕКТЫ ----------------
fx = np.zeros((N, 2))
# поворотник (в такт точке): 8.55–10.4 и 25.05–26.3
tick = burst(.03, 1500, 5000, .006)
for a, b in [(8.55, 10.4), (25.05, 26.3)]:
    k = int(np.ceil(a / .42))
    while k * .42 < b:
        place(fx, k * .42, tick, .5 if k % 2 == 0 else .35, .3); k += 1
# ключи: звон при падении в ладонь (21.6) и из кармана (57.8)
def jingle(t0, g):
    for i, f in enumerate([3100, 4200, 5300, 3700, 6100]):
        place(fx, t0 + i * .045 + rs.rand() * .02, tone(f, .5, .09), g * (.6 - i * .08), -.2 + i * .1)
jingle(21.88, .7); jingle(57.75, .6)
# шаги пассажира к башне (22.9–23.9)
step = burst(.12, 60, 400, .03)
for i in range(5): place(fx, 22.95 + i * .2, step, .5 - i * .07, -.4)
# лифт: гул и «дзынь» на 25-м
lt = np.arange(int(2.4 * SR)) / SR
place(fx, 26.4, np.sin(2 * np.pi * 96 * lt) * np.minimum(1, lt / .3) * np.minimum(1, (2.4 - lt) / .3) * (1 + .2 * np.sin(2 * np.pi * 7 * lt)), .35)
place(fx, 28.75, tone(1318, 1.2, .35) + .6 * tone(1760, 1.2, .25), .4, .2)
# вертолёт уходит (30.2–32.6)
ht = np.arange(int(2.6 * SR)) / SR
chop = norm(band(rs.randn(len(ht)), 60, 500)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 13 * ht))) * np.minimum(1, ht / .3) * np.linspace(1, 0, len(ht)) ** 1.3
place(fx, 30.2, chop, .8, -.5)
# телевизор: шипение помех (32.4–38.2)
tt = np.arange(int(5.8 * SR)) / SR
place(fx, 32.4, norm(band(rs.randn(len(tt)), 2500, 9000)) * np.minimum(1, tt / .1) * np.minimum(1, (5.8 - tt) / .2), .1, .3)
# помада по стеклу: четыре крестика
for t0 in [41.0, 41.42, 41.84, 42.26]:
    sq = burst(.16, 1800, 4200, .07); place(fx, t0, sq, .35, -.2); place(fx, t0 + .09, sq, .3, -.2)
# красная метка падения
place(fx, 46.5, tone(196, 1.4, .5) + .5 * tone(98, 1.4, .6), .5)
# телефон: гудок вызова, потом три ноты «нет сети»
rt = np.arange(int(.85 * SR)) / SR
place(fx, 52.25, np.sin(2 * np.pi * 425 * rt) * np.minimum(1, rt / .02) * np.minimum(1, (.85 - rt) / .02), .3, .3)
for i, f in enumerate([950, 1400, 1800]): place(fx, 53.18 + i * .2, tone(f, .17), .32, .3)
# лампа топлива: писк (54.5, 55.34)
for t0 in (54.5, 55.34): place(fx, t0, tone(2000, .12), .22, -.3)
# бег по парковке (58.6–60.2) и сигнализация «пик-пик»
for i in range(8): place(fx, 58.6 + i * .2, step, .45, .5 - i * .1)
for t0 in (59.0, 59.45): place(fx, t0, tone(2400, .14) + .5 * tone(3200, .14), .3, -.3)
# стрелка топлива — щелчок
place(fx, 60.4, burst(.05, 800, 3000, .012), .5, -.3)
# двигатель: запуск на «Хватит», гул на трассе до холма
et = np.arange(int(17.0 * SR)) / SR
rpm = np.interp(et, [0, .25, .9, 1.6, 12.2, 16.0, 16.7, 17.0], [22, 30, 52, 62, 66, 60, 34, 20])
ph = 2 * np.pi * np.cumsum(rpm) / SR
eng = (np.sin(ph) + .5 * np.sin(2 * ph + .5) + .3 * np.sin(3 * ph) + .2 * np.sign(np.sin(ph))) * (1 + .15 * np.sin(2 * np.pi * rpm / 2 * et))
eng = norm(band(eng, 30, 420)) * np.interp(et, [0, .1, .7, 4.7, 5.0, 12.2, 12.6, 16.0, 17.0], [0, .5, 1, 1, .7, .7, .5, .5, 0])
place(fx, 61.36, eng, .55)
# попадание в спутник (76.11)
bt = np.arange(int(2.2 * SR)) / SR
boom = np.sin(2 * np.pi * np.cumsum(np.interp(bt, [0, 2.2], [90, 28])) / SR) * np.exp(-bt / .6) + .5 * burst(2.2, 80, 1200, .25)
place(fx, 76.11, boom, .8)
# птицы на проводах: редкий щебет, обрывается на «Птицы замолчали»
def chirp(f0, f1, d):
    t = np.arange(int(d * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR) * np.sin(np.pi * t / d) ** 2
for t0, f0, f1, p in [(77.6, 3200, 4300, -.5), (77.75, 4100, 3300, -.5), (78.3, 3600, 4700, .4), (78.9, 4300, 3500, -.2), (79.05, 3500, 4400, .3), (79.38, 4000, 4900, -.4)]:
    place(fx, t0, chirp(f0, f1, .09), .16, p)
# свет растёт: нарастающий низкий гул и высокий звон, обрыв на вспышке
gt = np.arange(int(4.5 * SR)) / SR
rise = (np.sin(2 * np.pi * np.cumsum(np.interp(gt, [0, 4.5], [38, 58])) / SR) + .25 * np.sin(2 * np.pi * np.cumsum(np.interp(gt, [0, 4.5], [1900, 2600])) / SR) * (gt / 4.5)
        + .5 * norm(band(rs.randn(len(gt)), 200, 3000)) * (gt / 4.5) ** 2) * (gt / 4.5) ** 1.6
place(fx, 82.13, rise, 1.0)
place(fx, 86.6, np.sin(2 * np.pi * np.cumsum(np.interp(bt, [0, 2.2], [60, 24])) / SR) * np.exp(-bt / .45), .9)

os.makedirs("audio/zvuk", exist_ok=True)
for name, x in (("fon", fon), ("effekty", fx)):
    x = x / np.abs(x).max() * 0.7
    w = wave.open(f"audio/zvuk/{name}.wav", "w"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
print("готово: audio/zvuk/fon.wav, audio/zvuk/effekty.wav")
