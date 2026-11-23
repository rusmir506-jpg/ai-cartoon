#!/usr/bin/env python3
"""Offline Russian narration with Piper (free neural TTS) - replaces ElevenLabs when credits run out.
synth(texts, out_wav, ...) -> alignment dict in the same format as ElevenLabs with-timestamps
(characters + per-character start/end seconds), so make_story.py needs no other change.

Per beat: synthesise -> shorten long pauses (lively pace) -> slight speed-up -> concatenate with short gaps.
Word timing is estimated by spreading letters proportionally over the detected speech (pauses honoured)."""
import json, os, re, subprocess, wave
import numpy as np

VOICE = os.path.join(os.path.dirname(__file__), "assets/voices/ru_RU-irina-medium.onnx")
SR = 44100


def _run(args):
    return subprocess.run(args, capture_output=True, text=True)


def _dur(path):
    return float(_run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).stdout)


def _silences(path):
    err = _run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "silencedetect=noise=-36dB:d=0.09", "-f", "null", "-"]).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(st, en))


def synth(texts, out_wav, tempo=1.06, gap=0.22, length_scale=0.9, noise_scale=0.85, noise_w=0.95):
    from piper import PiperVoice, SynthesisConfig
    voice = PiperVoice.load(VOICE)
    cfg = SynthesisConfig(length_scale=length_scale, noise_scale=noise_scale, noise_w_scale=noise_w)
    work = os.path.join(os.path.dirname(out_wav), "_piper")
    os.makedirs(work, exist_ok=True)
    beats = []
    for i, tx in enumerate(texts):
        raw, fin = f"{work}/b{i}_raw.wav", f"{work}/b{i}.wav"
        with wave.open(raw, "wb") as w:
            voice.synthesize_wav(tx, w, syn_config=cfg)
        _run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
              "silenceremove=start_periods=1:start_threshold=-42dB:stop_periods=-1:stop_duration=0.16:stop_threshold=-36dB:stop_silence=0.13,"
              f"areverse,silenceremove=start_periods=1:start_threshold=-42dB,areverse,atempo={tempo},"
              "highpass=f=75,acompressor=threshold=-20dB:ratio=3:attack=8:release=120,aresample=44100,aformat=channel_layouts=mono",
              "-ar", str(SR), fin])
        d = _dur(fin)
        beats.append((tx, fin, d, _silences(fin)))
    # concatenate with gaps (numpy) and build the alignment
    chars, cs, ce = [], [], []
    t_off = 0.0
    pcm = []
    for bi, (tx, fin, d, sil) in enumerate(beats):
        with wave.open(fin, "rb") as w:
            pcm.append(np.frombuffer(w.readframes(w.getnframes()), dtype="<i2"))
        sil = [(a, min(b, d)) for a, b in sil if a > 0.05 and b < d - 0.02]
        speech = []
        cur = 0.0
        for a, b in sil:
            speech.append((cur, a))
            cur = b
        speech.append((cur, d))
        S = sum(b - a for a, b in speech)

        def real(s):
            for a, b in speech:
                if s <= b - a:
                    return a + s
                s -= b - a
            return d

        letters = sum(1 for c in tx if c.isalnum())
        done = 0.0
        for ch in tx:
            w = 1.0 if ch.isalnum() else 0.12
            s0, s1 = done / max(letters, 1) * S, (done + w) / max(letters, 1) * S
            chars.append(ch)
            cs.append(round(t_off + real(s0), 4))
            ce.append(round(t_off + real(min(s1, S)), 4))
            done += w
        t_off += d
        if bi < len(beats) - 1:
            g = gap + (0.12 if tx.rstrip().endswith(("?", ".")) and bi in (0,) else 0.0)
            chars.append(" ")
            cs.append(round(t_off, 4))
            ce.append(round(t_off + g, 4))
            pcm.append(np.zeros(int(g * SR), dtype="<i2"))
            t_off += g
    audio = np.concatenate(pcm)
    with wave.open(out_wav, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(audio.tobytes())
    return {"characters": chars, "character_start_times_seconds": cs, "character_end_times_seconds": ce}
