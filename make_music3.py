#!/usr/bin/env python3
"""Organic-house / sunset-lounge bed (120 BPM, A minor: Am9 - Fmaj9 - Cmaj9 - G6/9).
Usage: python3 make_music3.py <config.json> <out.wav>   (same config keys as make_music2.py)
Warm sub bass, sidechain-pumped pads, kalimba plucks, congas + shaker, soft four-on-the-floor,
filter-sweep riser at the start, groove drops out for the brand ending."""
import json, sys, wave
import numpy as np

SR = 44100
cfg = json.load(open(sys.argv[1]))
DUR = float(cfg.get("duration", 27))
N = int(SR * DUR)
MP = cfg.get("music_params", {})
END_AT, LIFT, THIN = MP.get("end_at", 23), MP.get("lift", [15, 19]), MP.get("thin_from", 999)
STAMPS = [s + 0.2 for s in cfg.get("stamps", [])]
rng = np.random.default_rng(41)
L = np.zeros(N + SR * 4)
R = np.zeros(N + SR * 4)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(i + len(sig), len(L))
    if j <= i:
        return
    s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt(0.5 * (1 - pan))
    R[i:j] += s * np.sqrt(0.5 * (1 + pan))


def lowpass(x, c, o=2):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) / (1 + (f / c) ** (2 * o)), len(x))


def highpass(x, c, o=2):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = (f / c) ** (2 * o)
    return np.fft.irfft(np.fft.rfft(x) * g / (1 + g), len(x))


def env(n, a, r):
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** 2
    e[n - nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def pad(notes, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for m in notes:
        for det in (-0.1, 0.0, 0.1):
            out += 2 * ((hz(m + det) * t + rng.uniform()) % 1.0) - 1
            out += 0.5 * np.sin(2 * np.pi * hz(m + det) * 2 * t)
    return lowpass(out, 1700) * env(n, 0.4, 0.8) / len(notes)


def kalimba(m, dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 3.96 * f * t) * np.exp(-t * 35) + 0.18 * np.sin(2 * np.pi * 8.1 * f * t) * np.exp(-t * 70)
    return s * np.exp(-t * 6.5) * env(n, 0.002, 0.05)


def sub(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * t) + 0.22 * np.sin(4 * np.pi * hz(m) * t)
    return np.tanh(1.4 * s) * env(n, 0.012, 0.08)


def kick():
    n = int(0.34 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(48 + 80 * np.exp(-t * 32)) / SR) * np.exp(-t * 10) * env(n, 0.001, 0.04)


def conga(f0, dur=0.28, slap=False):
    n = int(dur * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 0.5 * np.exp(-t * 40))) / SR) * np.exp(-t * 14)
    tick = lowpass(highpass(rng.standard_normal(n), 900), 5000) * np.exp(-t * (60 if not slap else 35)) * (0.5 if slap else 0.25)
    return (body + tick) * env(n, 0.001, 0.03)


def shaker(acc=1.0):
    n = int(0.07 * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 6500) * np.exp(-t * 55) * env(n, 0.006, 0.02) * acc


def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    x = highpass(lowpass(rng.standard_normal(n), 3400), 1100)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 30) * (t >= d) for d in (0.0, 0.011, 0.024))
    return x * e * 0.45


def ohat():
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 7600) * np.exp(-t * 22)


def thud():
    n = int(0.34 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-t * 28)) / SR) * np.exp(-t * 14)
    return (body + lowpass(rng.standard_normal(n), 2600) * np.exp(-t * 60) * 0.5) * env(n, 0.001, 0.05)


PROG = [  # pad voicing, sub root, kalimba tones
    ([57, 60, 64, 67, 71], 33 + 12, [69, 72, 76, 79]),    # Am9
    ([53, 57, 60, 64, 67], 29 + 12, [65, 69, 72, 76]),    # Fmaj9
    ([60, 64, 67, 71, 74], 36 + 12, [72, 76, 79, 83]),    # Cmaj9
    ([55, 59, 62, 64, 69], 31 + 12, [67, 71, 74, 76]),    # G6/9
]
PAT = [1, 0, 1, 1, 0, 1, 0, 1]
K, C_, HO = kick(), clap(), ohat()
CL, CM, CH = conga(120), conga(170), conga(250, 0.22, True)
bars = int(DUR / 2)
for b in range(bars):
    t0 = b * 2.0
    pv, root, kal = PROG[b % 4]
    last = t0 >= END_AT - 0.01
    if last:
        pv, root, kal = [57, 60, 64, 67, 71], 45, [69, 72, 76, 79]
    add(pad(pv, 2.8 if not last else 4.2), t0 - 0.2, 0.34 if t0 >= 3 else 0.28)
    if t0 < 3 or last:
        if last:
            for k, m in enumerate(kal):
                add(kalimba(m + 12, 1.2), t0 + 0.3 + k * 0.5, 0.08, (-1) ** k * 0.4)
            add(sub(root, 3.2), t0, 0.28)
        else:
            for k in range(2):
                add(kalimba(kal[3] + 12, 1.0), t0 + 0.5 + k * 1.0, 0.05, (-1) ** k * 0.4)
        continue
    lift = LIFT[0] <= t0 < LIFT[1]
    thin = t0 >= THIN
    for k in range(8):
        if PAT[k] and (t0 >= 7 or k % 2 == 0):
            add(kalimba(kal[(k * 3) % 4]), t0 + k * 0.25, 0.1 if lift else 0.075, (-1) ** k * 0.5)
            if lift:
                add(kalimba(kal[(k * 3) % 4] + 12, 0.4), t0 + k * 0.25 + 0.125, 0.03, (-1) ** k * -0.6)
    add(sub(root, 0.95), t0, 0.34)
    add(sub(root, 0.8), t0 + 1.0, 0.30)
    add(sub(root + 7, 0.3), t0 + 1.75, 0.18)
    for kk in ((0.0, 1.0) if thin else (0.0, 0.5, 1.0, 1.5)):
        add(K, t0 + kk, 0.5 if not thin else 0.4)
    for cc in (0.5, 1.5):
        add(C_, t0 + cc, 0.15 if t0 >= 7 else 0.09)
    for k in range(4):
        add(HO, t0 + k * 0.5 + 0.25, 0.026)
    if t0 >= 7:
        for k in range(8):                                  # congas: tumbao-style pattern
            tt = t0 + k * 0.25
            if k in (1, 3, 6):
                add(CH, tt, 0.16, 0.45)
            if k in (2, 7):
                add(CM, tt, 0.17, -0.35)
            if k == 4:
                add(CL, tt, 0.2, -0.2)
        for k in range(16):
            add(shaker(1.0 if k % 4 == 2 else 0.6), t0 + k * 0.125, 0.045 if lift else 0.032, 0.3)

n = int(2.9 * SR)
add(lowpass(highpass(rng.standard_normal(n), 2500) * np.linspace(0, 1, n) ** 3, 9000), 0.1, 0.02)
n = int(0.8 * SR)
add(lowpass(highpass(rng.standard_normal(n), 3500) * np.linspace(0, 1, n) ** 3, 9000), END_AT - 0.8, 0.02)
for s in STAMPS:
    add(thud(), s, 0.5)

# sidechain pump on everything tonal: duck 30% after each beat from 3 s
tt = np.arange(len(L)) / SR
ph = (tt - 3.0) % 0.5
pump = np.where((tt >= 3.0) & (tt < END_AT), 1 - 0.35 * np.exp(-ph * 9), 1.0)
L *= pump
R *= pump

n = int(2.2 * SR)
t = np.arange(n) / SR
for ch, seed in ((L, 1), (R, 2)):
    ir = lowpass(np.random.default_rng(seed).standard_normal(n) * np.exp(-t * 3.0), 5000)
    ir[: int(0.012 * SR)] = 0
    ch += 0.014 * np.fft.irfft(np.fft.rfft(ch, len(ch) + n) * np.fft.rfft(ir, len(ch) + n))[: len(ch)]

L, R = L[:N], R[:N]
tt = np.arange(N) / SR
m = np.clip(tt / 0.5, 0, 1) * np.clip((DUR - tt) / 2.2, 0, 1) ** 1.5
pk = max(np.abs(L * m).max(), np.abs(R * m).max())
st = np.stack([np.tanh(1.25 * L * m / pk), np.tanh(1.25 * R * m / pk)], 1)
st = st / np.abs(st).max() * 0.89
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print(sys.argv[2], DUR, "s")
