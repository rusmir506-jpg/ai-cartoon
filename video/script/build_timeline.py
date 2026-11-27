"""Assemble VO segments into one track (tempo x1.05) and export word-level timeline for Remotion."""
import json, subprocess, numpy as np, re
SR = 48000
TEMPO = 1.05
LEAD = 0.25          # silence before first word
GAP = 0.55           # pause between chapters
TAIL = 3.2           # outro after last word
segs = json.load(open("script/voiceover.json"))

def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-af", f"atempo={TEMPO}",
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)

pieces, words, segments = [], [], []
t = LEAD
for s in segs:
    a = decode(f"public/audio/vo/{s['id']}.mp3")
    al = json.load(open(f"script/align/{s['id']}.json"))
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    first = next(i for i, c in enumerate(chars) if c.strip())
    head = st[first] / TEMPO                      # trim leading silence
    a = a[int(max(0, head - 0.05) * SR):]
    off = t - max(0, head - 0.05)
    # words
    cur, w0, w1 = "", None, None
    for c, s0, s1 in zip(chars + [" "], st + [0], en + [0]):
        if c.isspace():
            if cur:
                words.append({"w": cur, "t0": round(off + w0 / TEMPO, 3), "t1": round(off + w1 / TEMPO, 3), "seg": s["id"]})
            cur = ""
        else:
            if not cur: w0 = s0
            cur += c; w1 = s1
    end = off + en[-1] / TEMPO
    segments.append({"id": s["id"], "start": round(t, 3), "end": round(end, 3)})
    pieces.append((t, a[: int((end - t + 0.15) * SR)]))
    t = end + GAP
total = segments[-1]["end"] + TAIL
buf = np.zeros(int(total * SR) + SR, dtype=np.float32)
for start, a in pieces:
    i = int(start * SR); buf[i:i + len(a)] += a
np.save("script/vo_track.npy", buf[: int(total * SR)])
json.dump({"fps": 30, "duration": round(total, 3), "segments": segments, "words": words},
          open("src/data/timeline.json", "w"), ensure_ascii=False, indent=1)
print("total", round(total, 2), "s;", len(words), "words")
for sg in segments: print(sg)
