"""Procedural sound design: tense documentary score + UI/impact SFX, ducked under VO, mastered to -14 LUFS.
Reads shot/sfx cues from src/data/shots.json (via shots.py) so audio stays in sync with visuals."""
import json, subprocess, numpy as np, scipy.io.wavfile as wavfile, sys
from scipy.signal import butter, sosfilt, fftconvolve
sys.path.insert(0, "script")
from shots import resolve, tl

SR = 48000
DUR = tl["duration"]
N = int(DUR * SR)
rng = np.random.default_rng(7)
t_all = np.arange(N) / SR

def lp(x, fc, o=2): return sosfilt(butter(o, fc, "low", fs=SR, output="sos"), x)
def hp(x, fc, o=2): return sosfilt(butter(o, fc, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), x)
def env(n, a, r):  # attack/exp-release envelope
    e = np.exp(-np.arange(n) / (r * SR)); k = max(1, int(a * SR)); e[:k] *= np.linspace(0, 1, k); return e
def add(buf, x, at):
    i = int(at * SR)
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x)); buf[i:j] += x[: j - i]
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

shots = resolve()
sec = {s["id"]: s["t"] for s in shots}
S = dict(hook=0, ch1=sec["c1"], ch2=sec["d1"], ch3=sec["e1"], ch4=sec["f1"], ch5=sec["g1"], ch6=sec["k1"], end=DUR)
order = ["hook", "ch1", "ch2", "ch3", "ch4", "ch5", "ch6"]

def section_curve(values, fade=1.2):
    """piecewise-constant per-section value with smooth crossfades"""
    out = np.zeros(N)
    for k, name in enumerate(order):
        a = S[name]; b = S[order[k + 1]] if k + 1 < len(order) else DUR
        out[int(a * SR): int(b * SR)] = values[name]
    w = int(fade * SR); ker = np.ones(w) / w
    return np.convolve(out, ker, mode="same")

# ---------------- MUSIC ----------------
BPM = 96; beat = 60 / BPM
# chord roots (midi) per bar, D minor dark progression: Dm Bb Gm A
prog = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]
bar = beat * 4
def chord_at(t): return prog[int(t / (bar * 2)) % 4]

# pad: detuned saws, filtered, per 2-bar chord
pad = np.zeros(N)
seg_len = bar * 2
for k in range(int(DUR / seg_len) + 1):
    t0 = k * seg_len; n = int((seg_len + 1.5) * SR)
    tt = np.arange(n) / SR
    ch = prog[k % 4]
    x = np.zeros(n)
    for m in ch + [ch[0] - 12]:
        for det in (-0.08, 0.0, 0.09):
            fr = mtof(m + det)
            x += 2 * ((tt * fr) % 1) - 1
    x = lp(x, 900) * 0.05
    e = np.minimum(1, tt / 1.2) * np.minimum(1, np.maximum(0, (seg_len + 1.5 - tt) / 1.5))
    add(pad, x * e, t0)
padlvl = section_curve(dict(hook=0.8, ch1=0.7, ch2=0.75, ch3=0.8, ch4=0.9, ch5=0.55, ch6=0.85))
pad *= padlvl

# dissonant low drone for crisis
drone = (np.sin(2 * np.pi * mtof(38) * t_all) + 0.6 * np.sin(2 * np.pi * mtof(39) * t_all) + 0.4 * np.sin(2 * np.pi * mtof(26) * t_all))
drone = lp(drone + 0.3 * rng.standard_normal(N) * 0.2, 400) * 0.18
drone *= section_curve(dict(hook=0.6, ch1=0, ch2=0, ch3=0, ch4=0, ch5=1.0, ch6=0.15), 0.6)

# sub bass on 8ths
bass = np.zeros(N)
for i in range(int(DUR / (beat / 2))):
    t0 = i * beat / 2; ch = chord_at(t0); n = int(beat / 2 * SR)
    tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * mtof(ch[0] - 12) * tt) + 0.3 * np.sin(2 * np.pi * mtof(ch[0]) * tt)
    add(bass, x * env(n, 0.005, 0.12) * 0.35, t0)
bass *= section_curve(dict(hook=0.0, ch1=0.35, ch2=0.8, ch3=0.9, ch4=1.0, ch5=0.0, ch6=0.45))

# kick
def kick():
    n = int(0.5 * SR); tt = np.arange(n) / SR
    f = 45 + 90 * np.exp(-tt * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, 0.001, 0.18) * 0.9
K = kick()
drums = np.zeros(N)
kick_on = dict(hook=2, ch1=2, ch2=1, ch3=1, ch4=1, ch5=4, ch6=2)  # every N beats
for name in order:
    a = S[name]; b = S[order[order.index(name) + 1]] if name != "ch6" else DUR - 3
    step = kick_on[name] * beat
    t = a
    while t < b - 0.05:
        add(drums, K * (0.8 if name in ("ch1", "ch6") else 1.0), t)
        if name == "ch5": add(drums, K * 0.6, t + 0.22)  # heartbeat double thump
        t += step
# hats in ch3/ch4
hat_src = hp(rng.standard_normal(int(0.06 * SR)), 7000) * env(int(0.06 * SR), 0.001, 0.015)
for name, div in (("ch3", 2), ("ch4", 4)):
    a = S[name]; b = S[order[order.index(name) + 1]]
    t = a; k = 0
    while t < b:
        add(drums, hat_src * (0.22 if k % 2 else 0.12), t); t += beat / div; k += 1

# arpeggio plucks
arp = np.zeros(N)
def pluck(fr, dur=0.35):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * fr * tt) + 0.4 * np.sin(2 * np.pi * 2 * fr * tt) + 0.15 * np.sin(2 * np.pi * 3 * fr * tt)
    return x * env(n, 0.002, 0.09)
for name, div, oct_ in (("ch2", 2, 12), ("ch3", 4, 24), ("ch4", 4, 24), ("ch6", 2, 24)):
    a = S[name]; b = S[order[order.index(name) + 1]] if name != "ch6" else DUR - 4
    t = a; k = 0
    while t < b:
        ch = chord_at(t); m = ch[[0, 1, 2, 1][k % 4]] + oct_ + (12 if k % 8 >= 6 else 0)
        add(arp, pluck(mtof(m)) * 0.12, t); t += beat / div; k += 1
# hook: slow piano-like ostinato
t = 0.0; k = 0
while t < S["ch1"] - 0.3:
    add(arp, pluck(mtof([62, 65, 69, 65][k % 4]), 0.9) * 0.10, t); t += beat; k += 1

music = pad + drone + bass + drums + arp
# simple reverb for music
ir_n = int(2.2 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / (0.55 * SR)); ir = lp(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
music = music + 0.35 * fftconvolve(music, ir)[:N]
# gaps/dropouts: brief silence right before chapter 5 hit
for name in ("ch5",):
    a = S[name]; i0, i1 = int((a - 0.45) * SR), int(a * SR)
    music[i0:i1] *= np.linspace(1, 0.05, i1 - i0)

# ---------------- SFX ----------------
def noise(d): return rng.standard_normal(int(d * SR))
def sweep_bp(x, f0, f1, q=0.6, steps=24):
    out = np.zeros_like(x); L = len(x); seg = L // steps
    for k in range(steps):
        fc = f0 * (f1 / f0) ** (k / steps)
        s = slice(k * seg, (k + 1) * seg if k < steps - 1 else L)
        out[s] = bp(x[s], fc * (1 - q / 2), min(fc * (1 + q / 2), SR / 2 - 100), 1)
    return out
def whoosh(d=0.55):
    x = sweep_bp(noise(d), 300, 4000); e = np.sin(np.linspace(0, np.pi, len(x))) ** 2; return x * e * 0.9
def swoosh(): return whoosh(0.3) * 0.8
def pop():
    n = int(0.12 * SR); tt = np.arange(n) / SR; f = 500 + 900 * (tt / 0.12)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.03) * 0.5
def click():
    n = int(0.03 * SR); return hp(noise(0.03), 2000) * env(n, 0.0005, 0.005) * 0.6
def tick():
    n = int(0.05 * SR); tt = np.arange(n) / SR; return (np.sin(2 * np.pi * 2400 * tt) * env(n, 0.0005, 0.008) + np.pad(click(), (0, n))[:n] * 0.5) * 0.6
def notify():
    out = np.zeros(int(0.5 * SR))
    for k, m in enumerate((84, 91)):
        n = int(0.35 * SR); tt = np.arange(n) / SR
        add_i = int(k * 0.11 * SR); out[add_i:add_i + n] += np.sin(2 * np.pi * mtof(m) * tt) * env(n, 0.002, 0.08) * 0.35
    return out
def stamp():
    n = int(0.4 * SR); tt = np.arange(n) / SR
    thud = np.sin(2 * np.pi * (60 + 120 * np.exp(-tt * 40)) * tt) * env(n, 0.001, 0.08)
    return (thud + lp(noise(0.4), 2500) * env(n, 0.001, 0.03) * 0.8) * 0.8
def glitch():
    d = 0.35; x = noise(d); n = len(x); out = np.zeros(n)
    for k in range(7):
        a = int(rng.uniform(0, 0.8) * n); L = int(rng.uniform(0.02, 0.06) * SR)
        tt = np.arange(L) / SR; out[a:a + L] = (np.sign(np.sin(2 * np.pi * rng.uniform(80, 900) * tt)) * 0.5 + x[a:a + L] * 0.5)[: len(out[a:a + L])]
    return bp(out, 200, 6000) * 0.45
def boom(d=1.8):
    n = int(d * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-tt * 6)) / SR) * env(n, 0.002, 0.6)
    return (s + lp(noise(d), 300) * env(n, 0.002, 0.25) * 0.6) * 0.9
def impact():
    b = boom(2.2); b[: int(0.4 * SR)] += stamp()[: int(0.4 * SR)] * 0.6
    b[: int(0.8 * SR)] += hp(noise(0.8), 3000) * env(int(0.8 * SR), 0.001, 0.25) * 0.25
    return b
def riser(d=1.6):
    n = int(d * SR); tt = np.arange(n) / SR
    x = sweep_bp(noise(d), 200, 6000) * (tt / d) ** 2
    tone = np.sin(2 * np.pi * np.cumsum(200 + 600 * (tt / d) ** 2) / SR) * (tt / d) ** 2 * 0.25
    return (x + tone) * 0.7
def cash():
    out = np.zeros(int(0.6 * SR))
    for k in range(4):
        n = int(0.3 * SR); tt = np.arange(n) / SR; fr = rng.uniform(2500, 4200)
        x = (np.sin(2 * np.pi * fr * tt) + 0.5 * np.sin(2 * np.pi * fr * 1.51 * tt)) * env(n, 0.001, 0.05) * 0.18
        i = int(k * 0.06 * SR); out[i:i + n] += x
    return out
def neon():
    n = int(0.6 * SR); tt = np.arange(n) / SR
    buzz = lp(np.sign(np.sin(2 * np.pi * 120 * tt)), 2000) * 0.15
    gate = np.repeat(rng.random(n // 1200 + 1) > 0.35, 1200)[:n]
    return buzz * gate * env(n, 0.01, 0.4)
def bell():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * 520 * r * tt) * a for r, a in ((1, 1), (2.76, 0.5), (5.4, 0.25))) * env(n, 0.001, 0.5) * 0.25
def heart():
    return np.concatenate([K * 0.9, np.zeros(1)])[: int(0.5 * SR)]
def lock():
    a = click(); b = stamp() * 0.4; out = np.zeros(int(0.4 * SR)); out[: len(a)] += a; out[int(0.08 * SR):int(0.08 * SR) + len(b)] += b[: len(out) - int(0.08 * SR)]; return out
GEN = dict(whoosh=whoosh, swoosh=swoosh, pop=pop, click=click, tick=tick, notify=notify, stamp=stamp, glitch=glitch, boom=boom,
           impact=impact, riser=riser, cash=cash, neon=neon, bell=bell, heart=heart, lock=lock)
GAIN = dict(whoosh=0.35, swoosh=0.3, pop=0.45, click=0.5, tick=0.5, notify=0.4, stamp=0.7, glitch=0.45, boom=0.75, impact=0.8,
            riser=0.3, cash=0.5, neon=0.4, bell=0.5, heart=0.8, lock=0.6)
sfx = np.zeros(N)
for s in shots:
    for typ, t in s["sfxt"]:
        x = GEN[typ]() * GAIN[typ]
        if typ == "riser": add(sfx, x, t - len(x) / SR)
        elif typ in ("whoosh", "swoosh"): add(sfx, x, t - 0.28)
        else: add(sfx, x, t - 0.02)
sfx = sfx + 0.18 * fftconvolve(sfx, ir)[:N]

# ---------------- MIX ----------------
vo = np.load("script/vo_track.npy")[:N]
vo = np.pad(vo, (0, N - len(vo)))
vo = hp(vo, 70)
# VO envelope for ducking
a = np.abs(vo); win = int(0.05 * SR)
envv = np.convolve(a, np.ones(win) / win, mode="same")
envv = envv / (envv.max() + 1e-9)
# release smoothing
rel = np.exp(-1 / (0.35 * SR)); sm = np.zeros(N); acc = 0.0
step = 240
for i in range(0, N, step):
    v = envv[i:i + step].max(); acc = max(v, acc * rel ** step); sm[i:i + step] = acc
duck = 1 - 0.55 * np.clip(sm * 3, 0, 1)

def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
music *= 0.11 / rms(music)
sfx *= 1.0 / max(1e-9, np.abs(sfx).max()) * 0.5
vo *= 0.2 / rms(vo[vo != 0]) if np.any(vo) else 1
# outro: music swell after last word then fade out
fade = np.ones(N); fo = int(2.0 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
sfx = sfx * (1 - 0.45 * (1 - duck) / 0.55)
mix_l = (vo + music * duck * 0.9 + sfx * 0.85) * fade
mix_r = mix_l.copy()
# light stereo widening on music+sfx
wide = (music * duck * 0.9 + sfx * 0.85) * fade
d = int(0.012 * SR)
mix_l += 0.15 * wide; mix_r += 0.15 * np.concatenate([np.zeros(d), wide[:-d]])
st = np.stack([mix_l, mix_r], 1)
st /= np.abs(st).max() / 0.9
wavfile.write("script/premaster.wav", SR, st.astype(np.float32))
# stems for editing
for name, x in (("music", music * duck), ("sfx", sfx), ("vo", vo)):
    wavfile.write(f"public/audio/stem_{name}.wav", SR, (np.clip(x / max(1e-9, np.abs(x).max()) * 0.9, -1, 1) * 32767).astype(np.int16))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "script/premaster.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "pcm_s16le", "public/audio/master.wav"], check=True)
print("ok", DUR)
