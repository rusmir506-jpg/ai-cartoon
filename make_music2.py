#!/usr/bin/env python3
"""Synthesises an upbeat tropical-house style bed (120 BPM, D major: D-A-Bm-G) for the 'passport' reel.
Usage: python3 make_music2.py formats/passport/config.json formats/passport/music.wav
Four-on-the-floor kick enters at 3 s with the passport page, marimba arpeggios build from 7 s,
soft paper-stamp thuds land on every stamp, the groove thins out at 19 s and resolves for the brand ending."""
import json, sys, wave
import numpy as np

SR = 44100
DUR = 27.0
DUR = float(json.load(open(sys.argv[1])).get("duration", 27))
N = int(SR * DUR)
rng = np.random.default_rng(23)
cfg = json.load(open(sys.argv[1]))
MP = cfg.get("music_params", {})
END_AT = MP.get("end_at", 23)
LIFT = MP.get("lift", [15, 19])
THIN = MP.get("thin_from", 19)
STAMPS = [s + 0.2 for s in cfg.get("stamps", [])]          # impact moments
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
        for det in (-0.08, 0.0, 0.08):
            out += 2 * ((hz(m + det) * t + rng.uniform()) % 1.0) - 1
    return lowpass(out, 1400) * env(n, 0.5, 0.9) / len(notes)


def marimba(m, dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 30) + 0.2 * np.sin(2 * np.pi * 9.2 * f * t) * np.exp(-t * 60)
    return s * np.exp(-t * 9) * env(n, 0.002, 0.04)


def chime(m, dur=1.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6) + 0.15 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 10)
    return s * np.exp(-t * 3.2) * env(n, 0.003, 0.2)


def bass(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(4 * np.pi * hz(m) * t)
    return np.tanh(1.6 * s) * env(n, 0.008, 0.06)


def kick():
    n = int(0.36 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(46 + 90 * np.exp(-t * 30)) / SR) * np.exp(-t * 9.5) * env(n, 0.001, 0.04)


def clap():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    x = highpass(lowpass(rng.standard_normal(n), 3600), 1000)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 34) * (t >= d) for d in (0.0, 0.010, 0.021))
    return x * e * 0.5


def hat(o=False):
    n = int((0.14 if o else 0.04) * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 7800) * np.exp(-t * (24 if o else 95))


def thud():
    n = int(0.34 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(60 + 70 * np.exp(-t * 28)) / SR) * np.exp(-t * 14)
    tick = lowpass(rng.standard_normal(n), 2600) * np.exp(-t * 60) * 0.5
    return (body + tick) * env(n, 0.001, 0.05)


PROG = [  # pad voicing, bass root, arp tones
    ([57, 62, 66, 69], 38, [62, 66, 69, 74]),   # D
    ([57, 61, 64, 69], 45, [61, 64, 69, 73]),   # A
    ([59, 62, 66, 71], 47, [62, 66, 71, 74]),   # Bm
    ([55, 59, 62, 67], 43, [62, 67, 71, 74]),   # G
]
ARP = [0, 1, 2, 3, 2, 1, 2, 1]
K, C, H, HO = kick(), clap(), hat(), hat(True)

for b in range(int(DUR / 2)):                                   # 2 s bars
    t0 = b * 2.0
    pv, root, arp = PROG[b % 4]
    last = t0 >= END_AT - 0.01
    if last:
        pv, root, arp = [57, 62, 66, 69, 74], 38, [62, 66, 69, 74]
    add(pad(pv, 2.9 if not last else 4.0), t0 - 0.2, 0.40 if t0 >= 3 else 0.30)
    for k, d in enumerate((0.0, 0.375, 0.75)):        # dotted-eighth shimmer echo
        add(chime(arp[-1] + 12), t0 + d, (0.07, 0.04, 0.022)[k], (-0.4, 0.4, -0.2)[k])
    if t0 < 3 or last:
        if last:
            for k, m in enumerate(arp):
                add(marimba(m + 12, 0.9), t0 + 0.25 + k * 0.5, 0.06, (-1) ** k * 0.3)
            add(bass(root, 3.0), t0, 0.26)
        continue
    for k in range(8):                                # 8th-note marimba arpeggio
        tt = t0 + k * 0.25
        if t0 >= 7 or k % 2 == 0:
            add(marimba(arp[ARP[k]] + 12), tt, 0.085 if LIFT[0] <= t0 < LIFT[1] else 0.065, (-1) ** k * 0.5)
        if LIFT[0] <= t0 < LIFT[1]:
            add(marimba(arp[ARP[k]] + 24, 0.3), tt + 0.125, 0.03, (-1) ** k * -0.6)
    quarter = t0 >= THIN
    for k in range(4 if quarter else 4):              # bass: off-beat 8ths, quarters in the thin section
        if quarter:
            add(bass(root, 0.4), t0 + k * 0.5, 0.26)
        else:
            add(bass(root, 0.22), t0 + k * 0.5 + 0.25, 0.30)
    kicks = (0.0, 1.0) if quarter else (0.0, 0.5, 1.0, 1.5)
    for kk in kicks:
        add(K, t0 + kk, 0.52 if not quarter else 0.4)
    for cc in (0.5, 1.5):
        add(C, t0 + cc, 0.20 if t0 >= 7 else 0.13)
    for k in range(4):
        add(HO if k % 2 == 0 else H, t0 + k * 0.5 + 0.25, 0.03)
    if t0 >= 7:
        for k in range(8):
            add(H, t0 + k * 0.25, 0.014 if k % 2 else 0.02, 0.3)

n = int(2.9 * SR)                                     # riser into the first beat
add(lowpass(highpass(rng.standard_normal(n), 2500) * np.linspace(0, 1, n) ** 3, 9000), 0.1, 0.02)
n = int(0.8 * SR)                                     # breath into the brand ending
add(lowpass(highpass(rng.standard_normal(n), 3500) * np.linspace(0, 1, n) ** 3, 9000), END_AT - 0.8, 0.02)
for s in STAMPS:
    add(thud(), s, 0.55)

n = int(2.0 * SR)                                     # light room reverb
t = np.arange(n) / SR
for ch, seed in ((L, 1), (R, 2)):
    ir = lowpass(np.random.default_rng(seed).standard_normal(n) * np.exp(-t * 3.4), 5000)
    ir[: int(0.01 * SR)] = 0
    ch += 0.012 * np.fft.irfft(np.fft.rfft(ch, len(ch) + n) * np.fft.rfft(ir, len(ch) + n))[: len(ch)]

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
