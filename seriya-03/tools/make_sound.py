#!/usr/bin/env python3
"""Фон и эффекты серии 2. Всё синтезируется здесь кодом (numpy) — чужих записей нет.
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
# тот же мрачный гул, что в серии 1 (звуковая тема сериала)
drone = np.zeros(N)
for f, a, lf in [(55, 1.0, .07), (55.6, .8, .05), (82.4, .5, .09), (110.3, .28, .11), (164.8, .10, .13)]:
    drone += a * np.sin(2 * np.pi * f * T + 2 * np.sin(2 * np.pi * lf * T)) * (0.8 + 0.2 * np.sin(2 * np.pi * lf * 0.6 * T + f))
rumble = norm(band(np.cumsum(rs.randn(N)), 30, 140))
drone = norm(drone) * 0.8 + rumble * 0.35
droneEnv = env([(0, 0), (1.2, 1), (70.2, 1.1), (71.25, .12), (72.7, .12), (76.5, 1.6), (76.62, 0), (DUR, 0)])
# горячий ветер: сильный на холме, тише в штабе
w1 = norm(band(rs.randn(N), 250, 900)); w2 = norm(band(rs.randn(N), 500, 2200))
gust = 0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * T + 1) * np.sin(2 * np.pi * 0.31 * T)
windEnv = env([(0, .6), (8.2, .6), (10.6, 1.4), (13.4, 1.2), (13.6, .25), (17.2, .5), (20.9, .3), (24.5, .7), (34.2, .5),
               (49.0, .5), (55.0, .1), (67.4, .1), (67.6, .6), (70.2, .6), (71.3, 0), (DUR, 0)])
wind = (w1 * gust + w2 * (1 - gust) * .5) * windEnv
# гул толпы на поле: шум в полосе голоса с медленной «болтовнёй»
babble = norm(band(rs.randn(N), 250, 1400)) * (0.7 + 0.3 * np.sin(2 * np.pi * 3.1 * T) * np.sin(2 * np.pi * 1.7 * T + 2))
crowdEnv = env([(0, 0), (17.2, 0), (17.5, .6), (20.8, .6), (21.0, 0), (34.1, 0), (34.4, .8), (38.0, .8), (38.1, .2), (39.3, .2), (39.5, .8),
                (42.5, .8), (42.7, .4), (49.1, .7), (52.2, .7), (52.4, 0), (67.5, 0), (67.8, 1.0), (69.5, 1.4), (70.3, 1.2), (71.0, 0), (DUR, 0)])
fon = np.stack([drone * droneEnv * .9 + wind * .5 + babble * crowdEnv * .35, drone * droneEnv * .9 + np.roll(wind, 4000) * .5 + np.roll(babble, 7000) * crowdEnv * .35], 1)

# ---------------- ЭФФЕКТЫ ----------------
fx = np.zeros((N, 2))
step = burst(.12, 60, 400, .03)
# «свет»: ровное гудение сопел, пока он летит (0–71.25), громче вблизи
st = np.arange(int(71.25 * SR)) / SR
hum = (np.sin(2 * np.pi * 180 * st) * .6 + np.sin(2 * np.pi * 360.7 * st) * .3 + .4 * norm(band(rs.randn(len(st)), 1500, 4000))) * np.interp(st, [0, 8, 10.6, 13.5, 70, 71.2, 71.25], [.05, .35, .5, .1, .25, .4, 0])
place(fx, 0, hum, .25)
# мигание в ритме поворотника: 8.25–10.6
tick = burst(.03, 1500, 5000, .006)
k = int(np.ceil(8.25 / .42))
while k * .42 < 10.6:
    place(fx, k * .42, tick, .45 if k % 2 == 0 else .3, .2); k += 1
# часы: тиканье (7:00 — раз в секунду, 3:00 — чаще)
for a, b, d in [(13.6, 17.2, .5), (52.35, 54.9, .25)]:
    t0 = a
    while t0 < b:
        place(fx, t0, burst(.02, 3000, 7000, .004), .4, -.1); t0 += d
place(fx, 15.09, tone(880, .6, .2), .3)
place(fx, 52.32, tone(660, .8, .25) + .6 * tone(622, .8, .25), .35)
# фото Лены и Тёмы — тихий звон
place(fx, 19.0, tone(1046, 1.4, .5) + .5 * tone(1568, 1.4, .4), .25)
# пробка: далёкие гудки
for t0, f0 in [(21.1, 420), (21.9, 380), (22.5, 460)]:
    ht = np.arange(int(.5 * SR)) / SR
    place(fx, t0, norm(band(np.sign(np.sin(2 * np.pi * f0 * ht)), 200, 1500)) * np.minimum(1, ht / .02) * np.minimum(1, (.5 - ht) / .05), .12, -.4)
# двигатель + гравий: грунтовка 24.55–26.4
et = np.arange(int(2.0 * SR)) / SR
ph = 2 * np.pi * np.cumsum(np.interp(et, [0, 2], [40, 58])) / SR
eng = norm(band(np.sin(ph) + .5 * np.sin(2 * ph) + .2 * np.sign(np.sin(ph)), 30, 420)) * np.interp(et, [0, .2, 1.7, 2], [0, 1, 1, 0])
place(fx, 24.5, eng, .45)
place(fx, 24.5, norm(band(rs.randn(len(et)), 800, 5000)) * (0.5 + 0.5 * (rs.rand(len(et)) > .97)) * np.interp(et, [0, .2, 1.7, 2], [0, 1, 1, 0]), .12, .2)
# кордон: короткий «вуп» сирены, треск рации, хлопок фонаря на «Назад!»
wt = np.arange(int(.7 * SR)) / SR
place(fx, 26.45, np.sin(2 * np.pi * np.cumsum(np.interp(wt, [0, .35, .7], [500, 1300, 600])) / SR) * np.minimum(1, wt / .02) * np.minimum(1, (.7 - wt) / .1), .22, .4)
ct = np.arange(int(.6 * SR)) / SR
place(fx, 27.9, norm(band(rs.randn(len(ct)), 1200, 3500)) * (rs.rand(len(ct)) > .5) * np.minimum(1, (.6 - ct) / .1), .12, .4)
place(fx, 29.57, burst(.5, 200, 6000, .12), .5)
# пропуск: шорох и щелчок; шлагбаум: скрип
place(fx, 30.75, burst(.25, 2000, 7000, .08), .2, .3)
place(fx, 32.31, tone(1318, .5, .15), .25)
sk = np.arange(int(.6 * SR)) / SR
place(fx, 33.3, np.sin(2 * np.pi * np.cumsum(520 + 160 * np.sin(2 * np.pi * 7 * sk)) / SR) * np.sin(np.pi * sk / .6) * .6, .3, -.4)
# громкоговоритель: свист обратной связи на «Сохраняйте» (35.3) и на крике Ани (62.9)
for t0, d, g in [(35.28, .9, .12), (62.9, 1.0, .2)]:
    fb = np.arange(int(d * SR)) / SR
    place(fx, t0, np.sin(2 * np.pi * 2750 * fb) * np.sin(np.pi * fb / d) ** 2, g, .3)
# гудок и фары: 39.4–41.3
for i in range(4):
    ht = np.arange(int(.3 * SR)) / SR
    hn = norm(band(np.sign(np.sin(2 * np.pi * 410 * ht)) + np.sign(np.sin(2 * np.pi * 517 * ht)), 250, 2500)) * np.minimum(1, ht / .01) * np.minimum(1, (.3 - ht) / .03)
    place(fx, 39.45 + i * .46, hn, .3)
# вертолёт на холостых у штаба: 50.6–52.3
ht = np.arange(int(1.7 * SR)) / SR
place(fx, 50.6, norm(band(rs.randn(len(ht)), 60, 500)) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * ht))) * np.sin(np.pi * ht / 1.7), .5, .4)
# полог палатки: шорох ткани
place(fx, 55.0, burst(.9, 300, 3000, .35), .3)
# экран «ведение»: писк и захват цели
place(fx, 60.9, tone(1760, .12), .25); place(fx, 61.1, tone(1760, .12), .25)
place(fx, 61.69, tone(988, .9, .3) + .5 * tone(494, .9, .35), .35)
# толпа двинулась: двигатели и шаги
for i in range(14): place(fx, 68.4 + i * .13, step, .3, -.6 + (i % 5) * .3)
# стоп: сопла глохнут
place(fx, 71.25, np.sin(2 * np.pi * np.cumsum(np.interp(bt := np.arange(int(1.2 * SR)) / SR, [0, 1.2], [180, 40])) / SR) * np.exp(-bt / .3), .4)
# посадка: нарастающий низкий гул и высокий звон, удар на вспышке
gt = np.arange(int(3.85 * SR)) / SR
rise = (np.sin(2 * np.pi * np.cumsum(np.interp(gt, [0, 3.85], [36, 60])) / SR) + .25 * np.sin(2 * np.pi * np.cumsum(np.interp(gt, [0, 3.85], [1900, 2700])) / SR) * (gt / 3.85)
        + .5 * norm(band(rs.randn(len(gt)), 200, 3000)) * (gt / 3.85) ** 2) * (gt / 3.85) ** 1.5
place(fx, 72.75, rise, 1.0)
bt2 = np.arange(int(2.2 * SR)) / SR
place(fx, 76.6, np.sin(2 * np.pi * np.cumsum(np.interp(bt2, [0, 2.2], [60, 24])) / SR) * np.exp(-bt2 / .45), .9)

os.makedirs("audio/zvuk", exist_ok=True)
for name, x in (("fon", fon), ("effekty", fx)):
    x = x / np.abs(x).max() * 0.7
    w = wave.open(f"audio/zvuk/{name}.wav", "w"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
print("готово: audio/zvuk/fon.wav, audio/zvuk/effekty.wav")
