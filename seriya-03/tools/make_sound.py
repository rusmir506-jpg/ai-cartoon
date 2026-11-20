#!/usr/bin/env python3
"""Фон и эффекты серии 3. Всё синтезируется здесь кодом (numpy) — чужих записей нет.
Запуск из папки серии: python3 tools/make_sound.py  ->  audio/zvuk/fon.wav, audio/zvuk/effekty.wav"""
import numpy as np, wave, os

SR, DUR = 48000, 69.0
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
droneEnv = env([(0, .6), (3.6, .5), (5.5, .15), (7.3, .3), (10.8, .7), (19.9, .9), (31.6, 1.2), (44.9, 1.1), (51.1, .6), (57.7, .9), (61.6, 1.2), (66.85, 1.6), (66.95, 0), (DUR, 0)])
w1 = norm(band(rs.randn(N), 250, 900)); w2 = norm(band(rs.randn(N), 500, 2200))
gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * T + 1) * np.sin(2 * np.pi * 0.31 * T)
windEnv = env([(0, .5), (4.8, .5), (6.3, 0), (37.0, 0), (37.3, .9), (42.8, .9), (43.0, 0), (DUR, 0)])
wind = (w1 * gust + w2 * (1 - gust) * .5) * windEnv
babble = norm(band(rs.randn(N), 250, 1400)) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * T) * np.sin(2 * np.pi * 1.7 * T + 2))
crowdEnv = env([(0, 0), (7.3, .5), (10.8, .15), (11.0, 0), (37.0, 0), (37.3, .8), (42.8, .8), (43.0, 0), (DUR, 0)])
fon = np.stack([drone * droneEnv * .9 + wind * .5 + babble * crowdEnv * .35, drone * droneEnv * .9 + np.roll(wind, 4000) * .5 + np.roll(babble, 7000) * crowdEnv * .35], 1)

# ---------------- ЭФФЕКТЫ ----------------
fx = np.zeros((N, 2))
step = burst(.12, 60, 400, .03)
bt = np.arange(int(2.2 * SR)) / SR
# посадка: мягкий глухой удар и пыль
place(fx, 0.25, np.sin(2 * np.pi * np.cumsum(np.interp(bt, [0, 2.2], [70, 30])) / SR) * np.exp(-bt / .5), .7)
place(fx, 0.3, norm(band(rs.randn(int(3 * SR)), 300, 3000)) * np.exp(-np.arange(int(3 * SR)) / SR / 1.0) * np.minimum(1, np.arange(int(3 * SR)) / SR / .2), .25)
# сопла: шипение, гаснет на «погасли»
ht = np.arange(int(1.2 * SR)) / SR
place(fx, 3.65, norm(band(rs.randn(len(ht)), 1500, 6000)) * np.interp(ht, [0, .4, 1.0, 1.2], [.6, .6, 0, 0]), .35)
# очки: щелчок
place(fx, 11.65, burst(.04, 2000, 6000, .01), .4, .3)
# «щитом»: высокий тревожный звон
place(fx, 16.95, tone(1975, 2.2, .9) * .5 + tone(2093, 2.2, .9) * .5, .18)
# ракета: далёкий нарастающий гул и свист
mt = np.arange(int(4.0 * SR)) / SR
place(fx, 20.2, (norm(band(rs.randn(len(mt)), 80, 600)) * .7 + .3 * np.sin(2 * np.pi * np.cumsum(np.interp(mt, [0, 4], [900, 1400])) / SR)) * (mt / 4) ** 1.2 * np.minimum(1, (4 - mt) / .2), .5, .5)
# экран: писк по ходу дуги, сирена зоны удара
for i in range(6): place(fx, 24.3 + i * .4, tone(1568, .08), .2, .3)
zt = np.arange(int(3.0 * SR)) / SR
place(fx, 28.6, np.sin(2 * np.pi * np.cumsum(700 + 250 * np.sin(2 * np.pi * 1.6 * zt)) / SR) * np.minimum(1, zt / .2) * np.minimum(1, (3 - zt) / .3), .14, .3)
# часы: тиканье (4:00 и 2:00 — чаще)
for a, b, d in [(27.4, 28.5, .33), (42.86, 44.95, .2)]:
    t0 = a
    while t0 < b:
        place(fx, t0, burst(.02, 3000, 7000, .004), .45, -.1); t0 += d
# фото — тихий звон
place(fx, 32.4, tone(1046, 1.3, .5) + .5 * tone(1568, 1.3, .4), .22)
# ключ: щелчок и запуск двигателя; двигатель до элеватора
place(fx, 36.3, burst(.05, 800, 3000, .012), .5, .3)
et = np.arange(int(9.0 * SR)) / SR
rpm = np.interp(et, [0, .4, 1.2, 7.8, 8.6, 9.0], [24, 40, 64, 66, 30, 20])
ph = 2 * np.pi * np.cumsum(rpm) / SR
eng = norm(band(np.sin(ph) + .5 * np.sin(2 * ph + .5) + .3 * np.sin(3 * ph) + .2 * np.sign(np.sin(ph)), 30, 420)) * np.interp(et, [0, .1, .6, 8.6, 9.0], [0, .5, 1, .6, 0])
place(fx, 36.35, eng, .5)
# встречные машины: проносящиеся гулы
for i in range(7):
    wt = np.arange(int(.9 * SR)) / SR
    place(fx, 37.4 + i * .75, norm(band(rs.randn(len(wt)), 200, 2500)) * np.sin(np.pi * wt / .9) ** 2, .3, -.7 if i % 2 else .7)
# трава по днищу
gt = np.arange(int(1.8 * SR)) / SR
place(fx, 41.0, norm(band(rs.randn(len(gt)), 1500, 7000)) * (rs.rand(len(gt)) > .6) * np.sin(np.pi * gt / 1.8), .2)
# фонарь у элеватора: гудение
lt = np.arange(int(4.2 * SR)) / SR
place(fx, 44.95, (np.sin(2 * np.pi * 100 * lt) + .5 * np.sin(2 * np.pi * 200 * lt)) * np.minimum(1, lt / .2) * np.minimum(1, (4.2 - lt) / .2), .06, .4)
# кепка: глухой низкий акцент
place(fx, 49.96, np.sin(2 * np.pi * 49 * bt) * np.exp(-bt / .8), .5)
# телефон: виброзвонок и мелодия, писк появившейся сети
for i in range(8):
    vt = np.arange(int(.35 * SR)) / SR
    place(fx, 52.27 + i * .66, norm(band(np.sign(np.sin(2 * np.pi * 150 * vt)), 80, 400)) * np.sin(np.pi * vt / .35), .3)
    place(fx, 52.27 + i * .66, tone(1318 if i % 2 == 0 else 1046, .3), .12, .2)
place(fx, 53.5, tone(2637, .12) + tone(3136, .12), .2, .2)
# люк: шипение и низкий гул, тяжёлые шаги
place(fx, 61.7, norm(band(rs.randn(int(1.0 * SR)), 800, 6000)) * np.exp(-np.arange(int(1.0 * SR)) / SR / .35), .4)
hh = np.arange(int(5.2 * SR)) / SR
place(fx, 61.7, np.sin(2 * np.pi * 73 * hh) * np.minimum(1, hh / .5) * np.minimum(1, (5.2 - hh) / .1), .35)
for i in range(3): place(fx, 62.7 + i * .5, burst(.18, 40, 250, .06), .7)
# последняя фраза: высокий звенящий тон нарастает и обрывается
rt = np.arange(int(1.6 * SR)) / SR
place(fx, 65.3, (np.sin(2 * np.pi * 2349 * rt) + .6 * np.sin(2 * np.pi * 2489 * rt)) * (rt / 1.6) ** 2, .25)
place(fx, 66.9, np.sin(2 * np.pi * np.cumsum(np.interp(bt, [0, 2.2], [60, 24])) / SR) * np.exp(-bt / .45), .9)

os.makedirs("audio/zvuk", exist_ok=True)
for name, x in (("fon", fon), ("effekty", fx)):
    x = x / np.abs(x).max() * 0.7
    w = wave.open(f"audio/zvuk/{name}.wav", "w"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
print("готово: audio/zvuk/fon.wav, audio/zvuk/effekty.wav")
