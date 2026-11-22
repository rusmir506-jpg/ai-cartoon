#!/usr/bin/env python3
"""Builds a 'tips' format reel: python3 build_tips.py formats/<name>/config.json
Animated typography (render_tips.js) + shared lounge bed (audio/music.wav) + Russian voice-over (gen_vo.py)."""
import subprocess, sys, os, json
cfg = sys.argv[1]
C = json.load(open(cfg))
name = C["name"]
renderer = C.get("renderer", "render_tips.js")
d = os.path.dirname(cfg)
VO_AT = C.get("vo_at", [0.15, 3.25, 7.25, 11.25, 15.25, 19.25, 23.3])
MUSIC = C.get("music", "audio/music.wav")
TOTAL = 27
os.makedirs("out/tmp", exist_ok=True)
vid = f"out/tmp/{name}_silent.mp4"
if subprocess.run(["node", renderer, cfg, vid]).returncode:
    sys.exit("render failed")
inputs = ["-i", vid, "-i", MUSIC]
fc, vo = [], []
for k, at in enumerate(VO_AT, 1):
    inputs += ["-i", f"{d}/audio/vo{k}.mp3"]
    fc.append(f"[{k + 1}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={int(at * 1000)}:all=1[v{k}]")
    vo.append(f"[v{k}]")
fc.append(f"{''.join(vo)}amix=inputs={len(vo)}:normalize=0,apad=whole_dur={TOTAL},highpass=f=90,asplit[voa][vob]")
fc.append("[1:a]volume=0.62[mu];[mu][vob]sidechaincompress=threshold=0.02:ratio=5:attack=40:release=450[duck];"
          "[duck][voa]amix=inputs=2:normalize=0[mix]")
fc.append(f"[mix]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,afade=out:st={TOTAL - 1.2}:d=1.2[aout]")
out = f"out/invoyage_{name}.mp4"
r = subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", ";".join(fc), "-map", "0:v", "-map", "[aout]",
                   "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-t", str(TOTAL), "-movflags", "+faststart", out])
if r.returncode:
    sys.exit("mux failed")
print(out)
