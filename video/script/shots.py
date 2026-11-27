"""Resolve shot cue words to times (mirror of src/timeline.ts). Prints the storyboard table."""
import json, re
tl = json.load(open("src/data/timeline.json")); shots = json.load(open("src/data/shots.json"))
W = tl["words"]; segs = {s["id"]: s for s in tl["segments"]}
norm = lambda s: re.sub(r"[«».,:;!?—]", "", s.lower()).replace("ё", "е")
def find(seg, cue, n=1, frm=0):
    k = 0
    for i in range(frm, len(W)):
        if W[i]["seg"] == seg and (norm(W[i]["w"]) == norm(cue) or (len(cue) >= 4 and norm(W[i]["w"]).startswith(norm(cue)))):
            k += 1
            if k == n: return i
    raise SystemExit(f"cue not found {seg}/{cue}")
def resolve():
    out = []
    for s in shots:
        first = next(i for i, w in enumerate(W) if w["seg"] == s["seg"])
        wi = find(s["seg"], s["cue"], s.get("n", 1), first)
        t = 0 if wi == 0 else min(W[wi]["t0"] - (0.3 if s.get("chapter") else 0.12), segs[s["seg"]]["start"] - 0.15 if s.get("chapter") else 1e9)
        sfx = []
        for typ, c in s.get("sfx", []):
            j = find(s["seg"], c, 1, wi)
            sfx.append((typ, W[j]["t0"]))
        out.append({**s, "wi": wi, "t": t, "sfxt": sfx})
    return out
if __name__ == "__main__":
    r = resolve()
    for i, s in enumerate(r):
        end = r[i + 1]["t"] if i + 1 < len(r) else tl["duration"]
        txt = " ".join(w["w"] for w in W if s["t"] <= w["t0"] < end)
        print(f'{s["t"]:6.2f}-{end:6.2f} ({end-s["t"]:4.1f}s) {s["id"]:3} {s["scene"]:13} | {txt}')
