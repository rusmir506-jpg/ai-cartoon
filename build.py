#!/usr/bin/env python3
"""Assembles the 27 s InVoyage x Alila Seminyak reel (1080x1920, 30 fps).

Put real footage of the hotel into footage/ named by slot prefix:

    01_*  hook       0-3 s    02_*  pool        3-7 s    03_*  rooms    7-11 s
    04_*  beach     11-15 s   05_*  experience 15-19 s   06_*  highlight 19-23 s

Videos (mp4/mov/m4v/webm) or photos (jpg/png/webp) both work. Several files
in one slot (05a_spa.mp4, 05b_seasalt.mp4) share that slot's time equally.
The 23-27 s brand ending is generated from overlays/.

    python3 build.py            # final render -> out/invoyage_alila_seminyak.mp4
    python3 build.py --no-vo    # music only
    python3 build.py --4k       # 2160x3840 export

A slot without footage gets a labelled neutral placeholder and the file is
written as *_PREVIEW.mp4 so it cannot be mistaken for the final cut.
"""
import glob
import os
import subprocess
import sys

from PIL import Image, ImageDraw

FPS = 30
W, H = (2160, 3840) if "--4k" in sys.argv else (1080, 1920)
XF = 0.5                                   # cross-dissolve length
SLOTS = [("01", "hook", 3), ("02", "pool", 4), ("03", "rooms", 4),
         ("04", "beach", 4), ("05", "experience", 4), ("06", "highlight", 4)]
END = 4
TOTAL = sum(s[2] for s in SLOTS) + END     # 27
VO_AT = [0.15, 3.45, 7.45, 11.45, 15.45, 19.4, 23.15]
VID = (".mp4", ".mov", ".m4v", ".webm", ".mkv")
IMG = (".jpg", ".jpeg", ".png", ".webp")
GRADE = "colorbalance=rm=0.025:bm=-0.025:rh=0.015:bh=-0.02,eq=contrast=1.04:saturation=1.06"
ENC = ["-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", str(FPS)]
os.makedirs("out/tmp", exist_ok=True)


def run(args):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y"] + args)
    if r.returncode:
        sys.exit("ffmpeg failed: " + " ".join(args))


def probe_dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return float(out.strip() or 0)


def placeholder(tag, name, path):
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im)
    for y in range(H):
        k = y / H
        d.line([(0, y), (W, y)], fill=(int(70 + 40 * k), int(84 + 30 * k), int(92 + 20 * k)))
    d.text((W // 2, H // 3), f"FOOTAGE NEEDED\nfootage/{tag}_{name}.mp4", fill=(235, 230, 220),
           anchor="mm", align="center", font_size=W // 22)
    im.save(path)


# Camera move per slot for still photos: (zoom0, zoom1, cx0, cx1, cy0, cy1).
# cx/cy = where the 9:16 window sits inside the photo (0 = left/top, 1 = right/bottom).
MOVES = {"01": (1.00, 1.09, .50, .50, .55, .62), "02": (1.10, 1.00, .50, .50, .60, .50),
         "03": (1.00, 1.10, .50, .50, .50, .58), "04": (1.00, 1.00, .30, .98, .50, .50),
         "05": (1.00, 1.00, .30, .82, .50, .50),
         "06": (1.03, 1.03, .15, .95, .50, .50)}


def photo_shot(f, n, out, tag):
    """Animates a still with a sub-pixel pan/zoom. Aspect ratio is never distorted.
    Photos too small to fill 9:16 are shown as a framed card over their own blur."""
    from PIL import ImageFilter
    im = Image.open(f).convert("RGB")
    iw, ih = im.size
    card = None
    if max(W / iw, H / ih) > 3.3:                       # too small to fill the frame
        cw = int(W * 0.84)
        card = im.resize((cw, round(ih * cw / iw)), Image.LANCZOS).filter(
            ImageFilter.UnsharpMask(radius=3, percent=60, threshold=2))
        im = im.resize((W // 4, round(ih * W / iw / 4)), Image.LANCZOS)
        bw = round(H * iw / ih)
        im = im.resize((bw, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(W // 18))
        im = Image.eval(im, lambda v: int(v * 0.72))
        iw, ih = im.size
        mv = (1.0, 1.12, .5, .5, .5, .5)
    else:
        mv = MOVES.get(tag, (1.0, 1.07, .5, .5, .5, .5))
    z0, z1, x0, x1, y0, y1 = mv
    bw0, bh0 = (iw, iw * H / W) if iw / ih < W / H else (ih * W / H, ih)   # largest 9:16 window
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-vf", GRADE + ",setsar=1"]
                         + ENC + ["-crf", "14", out], stdin=subprocess.PIPE)
    for k in range(n):
        u = k / max(1, n - 1)
        z = z0 + (z1 - z0) * u
        bw, bh = bw0 / z, bh0 / z
        x = (iw - bw) * (x0 + (x1 - x0) * u)
        y = (ih - bh) * (y0 + (y1 - y0) * u)
        fr = im.resize((W, H), Image.BICUBIC if card else Image.LANCZOS, box=(x, y, x + bw, y + bh))
        if card:
            s = 1.0 + 0.035 * u
            c = card.resize((round(card.width * s), round(card.height * s)), Image.LANCZOS)
            cx, cy = (W - c.width) // 2, int(H * 0.37) - c.height // 2
            sh = Image.new("L", (W, H), 0)
            ImageDraw.Draw(sh).rectangle([cx - 6, cy + 14, cx + c.width + 6, cy + c.height + 34], fill=120)
            fr.paste((12, 8, 4), (0, 0), sh.filter(ImageFilter.GaussianBlur(28)))
            fr.paste(c, (cx, cy))
        p.stdin.write(fr.tobytes())
    p.stdin.close()
    if p.wait():
        sys.exit("ffmpeg failed on " + f)


# ---- 1. collect shots -------------------------------------------------------
shots, preview = [], False                 # (file, duration, slow-mo?)
for tag, name, dur in SLOTS:
    files = sorted(f for f in glob.glob(f"footage/{tag}*") if f.lower().endswith(VID + IMG))
    if not files:
        preview = True
        ph = f"out/tmp/ph_{tag}.png"
        placeholder(tag, name, ph)
        files = [ph]
    for f in files:
        shots.append((f, dur / len(files), tag == "06"))

# ---- 2. conform every shot to WxH, graded, with dissolve handles -------------
clips = []
for i, (f, dur, slow) in enumerate(shots):
    length = dur + XF / 2 + (XF / 2 if i else 0)      # last shot dissolves into end card
    out = f"out/tmp/shot{i:02d}.mp4"
    cover = f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H}"
    if f.lower().endswith(VID):
        src = probe_dur(f)
        speed = 1.0
        if slow and src >= length * 0.6 + 0.2:
            speed = 0.6                                  # gentle slow motion on the highlight
        need = length * speed
        start = max(0.0, (src - need) / 2)               # take the middle of the clip
        vf = f"setpts=PTS/{speed},fps={FPS},{cover},{GRADE},setsar=1"
        if src < need:
            print(f"!! {f}: only {src:.1f}s, needs {need:.1f}s - last frame will hold")
            vf += f",tpad=stop_mode=clone:stop_duration={length}"
        run(["-ss", f"{start:.3f}", "-i", f, "-an", "-vf", vf, "-t", f"{length:.3f}"] + ENC + ["-crf", "14", out])
    else:
        photo_shot(f, int(round(length * FPS)), out, f.split('/')[-1][:2])
    clips.append((out, length))

# ---- 3. brand ending --------------------------------------------------------
end_len = END + XF / 2
end = "out/tmp/end.mp4"
run(["-loop", "1", "-t", f"{end_len}", "-i", "overlays/end_bg.png",
     "-loop", "1", "-t", f"{end_len}", "-i", "overlays/end_text.png", "-filter_complex",
     f"color=c=0xF6F8F8:s={W}x{H}:r={FPS}:d={end_len}[bg];"
     f"[0:v]scale={W}:{H},format=rgba,fade=in:st=0.15:d=0.9:alpha=1[logo];"
     f"[1:v]scale={W}:{H},format=rgba,fade=in:st=1.15:d=0.9:alpha=1[txt];"
     f"[bg][logo]overlay[a];[a][txt]overlay,fade=out:st={end_len - 0.45}:d=0.45:c=white,format=yuv420p[v]",
     "-map", "[v]", "-t", f"{end_len}"] + ENC + ["-crf", "12", end])
clips.append((end, end_len))

# ---- 4. scrim for caption legibility ----------------------------------------
import math
col = Image.new("L", (1, H))
for y in range(H):                                  # soft band behind the caption + bottom falloff
    band = 118 * math.exp(-((y / H - 0.69) / 0.13) ** 2)
    foot = 70 * max(0.0, (y / H - 0.72) / 0.28)
    col.putpixel((0, y), int(min(150, band + foot)))
scrim = Image.new("RGBA", (W, H), (18, 12, 6, 0))
scrim.putalpha(col.resize((W, H)))
scrim.save("out/tmp/scrim.png")

# ---- 5. dissolve chain + captions + audio -----------------------------------
inputs, fc = [], []
for path, _ in clips:
    inputs += ["-i", path]
cur, t = "[0:v]", clips[0][1]
for i in range(1, len(clips)):
    off = t - XF
    fc.append(f"{cur}[{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[x{i}]")
    cur, t = f"[x{i}]", off + clips[i][1]
n_in = len(clips)
last_cap = TOTAL - END
inputs += ["-loop", "1", "-t", str(TOTAL), "-i", "out/tmp/scrim.png"]
fc.append(f"[{n_in}:v]format=rgba,fade=in:st=0:d=0.6:alpha=1,fade=out:st={last_cap - 0.5}:d=0.5:alpha=1[sc];"
          f"{cur}[sc]overlay=shortest=0[c0]")
cur, n_in, t0 = "[c0]", n_in + 1, 0.0
for k, (_, _, dur) in enumerate(SLOTS, 1):
    inputs += ["-loop", "1", "-t", str(TOTAL), "-i", f"overlays/cap{k}.png"]
    a, b = t0 + (0.25 if k == 1 else 0.45), t0 + dur - 0.3
    fc.append(f"[{n_in}:v]scale={W}:{H},format=rgba,fade=in:st={a}:d=0.7:alpha=1,"
              f"fade=out:st={b - 0.45}:d=0.45:alpha=1[t{k}];{cur}[t{k}]overlay=enable='between(t,{a},{b})'[c{k}]")
    cur, n_in, t0 = f"[c{k}]", n_in + 1, t0 + dur
fc.append(f"{cur}fade=in:st=0:d=0.35,format=yuv420p[vout]")

inputs += ["-i", "audio/music.wav"]
m = n_in
if "--no-vo" in sys.argv:
    fc.append(f"[{m}:a]volume=0.9[mix]")
else:
    vo = []
    for k, at in enumerate(VO_AT, 1):
        inputs += ["-i", f"audio/vo{k}.mp3"]
        fc.append(f"[{m + k}:a]aresample=44100,aformat=channel_layouts=stereo,"
                  f"adelay={int(at * 1000)}:all=1[v{k}]")
        vo.append(f"[v{k}]")
    fc.append(f"{''.join(vo)}amix=inputs={len(vo)}:normalize=0,apad=whole_dur={TOTAL},"
              f"highpass=f=90,asplit[voa][vob]")
    fc.append(f"[{m}:a]volume=0.62[mu];[mu][vob]sidechaincompress=threshold=0.02:ratio=5:"
              f"attack=40:release=450[duck];[duck][voa]amix=inputs=2:normalize=0[mix]")
fc.append(f"[mix]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,"
          f"afade=out:st={TOTAL - 1.2}:d=1.2[aout]")

name = "out/invoyage_alila_seminyak" + ("_4k" if W > 1080 else "") + ("_PREVIEW" if preview else "") + ".mp4"
run(inputs + ["-filter_complex", ";".join(fc), "-map", "[vout]", "-map", "[aout]",
              "-frames:v", str(TOTAL * FPS), "-t", str(TOTAL)] + ENC +
    ["-crf", "16", "-profile:v", "high", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", name])
print(name, f"{probe_dur(name):.3f}s", "PREVIEW (placeholders - add footage)" if preview else "FINAL")
