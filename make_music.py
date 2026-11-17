#!/usr/bin/env python3
"""Synthesises the 27 s lounge bed (audio/music.wav).

120 BPM grid played half-time, so it feels like a slow 60 BPM lounge groove.
Bars are 2 s long and start at 3 s, which puts a downbeat on every picture
cut (3, 7, 11, 15, 19, 23 s). Arrangement builds block by block and resolves
on the brand ending.
"""
import wave
import numpy as np

SR = 44100
DUR = 27.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(7)
L = np.zeros(N + SR * 4)
R = np.zeros(N + SR * 4)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    j = min(i + len(sig), len(L))
    s = sig[: j - i] * gain
    L[i:j] += s * np.sqrt(0.5 * (1 - pan))
    R[i:j] += s * np.sqrt(0.5 * (1 + pan))


def lowpass(x, cutoff, order=2):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(spec / (1 + (f / cutoff) ** (2 * order)), len(x))


def highpass(x, cutoff, order=2):
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = (f / cutoff) ** (2 * order)
    return np.fft.irfft(spec * g / (1 + g), len(x))


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    e[n - nr:] *= np.linspace(1, 0, nr) ** 2
    return e


def pad(notes, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for m in notes:
        for det in (-0.07, 0.0, 0.07):
            f = hz(m + det)
            ph = rng.uniform(0, 1)
            out += 2 * ((f * t + ph) % 1.0) - 1
    return lowpass(out, 900) * env(n, 1.2, 1.4) / len(notes)


def rhodes(m, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    bell = np.sin(2 * np.pi * f * 14 * t) * np.exp(-t * 18) * 0.25
    body = np.sin(2 * np.pi * f * t + 1.4 * np.exp(-t * 3.0) * np.sin(2 * np.pi * f * t) + bell)
    return body * np.exp(-t * 1.6) * env(n, 0.004, 0.08) * vel


def pluck(m, dur=0.6):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 9)
    return s * np.exp(-t * 7) * env(n, 0.003, 0.05)


def bass(m, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return np.tanh(1.5 * s) * env(n, 0.012, 0.09)


def kick():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    f = 44 + 80 * np.exp(-t * 26)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8.5) * env(n, 0.001, 0.05)


def clap():
    n = int(0.28 * SR)
    t = np.arange(n) / SR
    x = highpass(lowpass(rng.standard_normal(n), 3200), 900)
    e = sum(np.exp(-np.clip(t - d, 0, None) * 30) * (t >= d) for d in (0.0, 0.011, 0.023))
    return x * e * 0.5


def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 7500) * np.exp(-t * (22 if open_ else 85))


# --- harmony: one chord per 4 s picture block (C major, warm & resolved) ----
#        (start, pad/rhodes voicing,        bass root)
CHORDS = [
    (3, [62, 65, 69, 72, 76], 38),   # Dm9    pool
    (7, [64, 67, 71, 74], 40),       # Em7    rooms
    (11, [65, 69, 72, 76, 79], 41),  # Fmaj9  beach
    (15, [67, 71, 74, 76], 43),      # G6     experience
    (19, [69, 72, 76, 79, 83], 45),  # Am9    highlight
    (23, [60, 64, 67, 71, 74], 36),  # Cmaj9  brand ending
]

# Hook: airy swell that opens into the first downbeat
add(pad([65, 69, 72, 76, 79], 4.2), 0.0, 0.50)
add(rhodes(84, 2.5, 0.5), 0.25, 0.30, 0.3)
add(rhodes(79, 2.5, 0.5), 1.25, 0.26, -0.3)
add(rhodes(76, 2.0, 0.5), 2.25, 0.24, 0.2)
n = int(2.6 * SR)
riser = highpass(rng.standard_normal(n), 3000) * np.linspace(0, 1, n) ** 3
add(lowpass(riser, 9000), 0.4, 0.012)

for t0, notes, root in CHORDS:
    last = t0 == 23
    add(pad(notes, 5.2 if not last else 4.6), t0 - 0.5, 0.46)
    # Rhodes stabs on the off-beats, stereo spread
    stabs = [0.0, 1.5, 2.75] if not last else [0.0]
    for k, off in enumerate(stabs):
        for i, m in enumerate(notes):
            add(rhodes(m, 2.4 if not last else 4.0, 0.9), t0 + off + i * 0.012,
                0.105 if k == 0 else 0.07, (i / (len(notes) - 1) - 0.5) * 0.9)
    if t0 >= 7 and not last:
        for off, d in ((0.0, 0.7), (0.75, 0.2), (1.5, 0.45), (2.0, 0.7), (2.75, 0.2), (3.5, 0.4)):
            add(bass(root, d), t0 + off, 0.34)
    if last:
        add(bass(root, 2.8), t0, 0.30)
    if t0 >= 15 and not last:
        arp = [notes[1] + 12, notes[2] + 12, notes[-1] + 12, notes[2] + 12]
        for k in range(16):
            add(pluck(arp[k % 4]), t0 + k * 0.25, 0.055 + 0.01 * (t0 >= 19), 0.6 * (-1) ** k)

# --- drums: enter softly at 3 s, build, drop out for the brand ending -------
K, C, H, HO = kick(), clap(), hat(), hat(True)
for bar in np.arange(3, 23, 2.0):
    add(K, bar, 0.62)
    add(K, bar + 1.25, 0.40 if bar >= 7 else 0.0)
    if bar >= 11:
        add(C, bar + 1.0, 0.22)
    if bar >= 7:
        for k in range(8):
            add(H, bar + k * 0.25, 0.05 if k % 2 else 0.028, 0.25)
        add(HO, bar + 1.75, 0.035, -0.2)
add(K, 23.0, 0.5)
n = int(0.9 * SR)
for cut in (7, 11, 15, 19, 23):          # soft reversed-cymbal breath into each cut
    sw = highpass(rng.standard_normal(n), 5000) * np.linspace(0, 1, n) ** 4
    add(lowpass(sw, 9000), cut - 0.9, 0.012)

# --- space, glue, master -----------------------------------------------------
n = int(2.2 * SR)
t = np.arange(n) / SR
for ch, seed in ((L, 1), (R, 2)):
    ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-t * 3.2)
    ir = lowpass(ir, 5000)
    ir[: int(0.012 * SR)] = 0
    wet = np.fft.irfft(np.fft.rfft(ch, len(ch) + n) * np.fft.rfft(ir, len(ch) + n))[: len(ch)]
    ch += 0.012 * wet

L, R = L[:N], R[:N]
tt = np.arange(N) / SR
master = np.clip(tt / 0.6, 0, 1) * (0.72 + 0.28 * np.clip(tt / 19.0, 0, 1))   # gentle build
master *= np.clip((DUR - tt) / 2.2, 0, 1) ** 1.5                               # fade out
peak = max(np.abs(L * master).max(), np.abs(R * master).max())
st = np.stack([np.tanh(1.3 * L * master / peak), np.tanh(1.3 * R * master / peak)], 1)
st = st / np.abs(st).max() * 0.89
with wave.open("audio/music.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print("audio/music.wav", DUR, "s")
