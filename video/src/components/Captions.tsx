import React from "react";
import { useCurrentFrame } from "remotion";
import { WORDS, FPS } from "../timeline";
import { C, F, textGlow } from "../theme";
import { sp } from "./anim";

type Chunk = { words: typeof WORDS; t0: number; t1: number };
const chunks: Chunk[] = [];
{
  let cur: typeof WORDS = [];
  const flush = () => { if (cur.length) chunks.push({ words: cur, t0: cur[0].t0, t1: cur[cur.length - 1].t1 }); cur = []; };
  WORDS.forEach((w, i) => {
    if (cur.length && cur[0].seg !== w.seg) flush();
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (len > 22 || cur.length >= 4)) flush();
    if (w.w === "—") { if (cur.length) cur.push(w); return; }
    cur.push(w);
    if (/[.,:!?]$/.test(w.w)) flush();
    const nx = WORDS[i + 1];
    if (nx && nx.t0 - w.t1 > 0.35) flush();
  });
  flush();
}

const accent = (w: string) => /\d|%|ipo|forbes|plata|«/i.test(w) || /^(миллиард|миллион|долл|процент|лейкемия|даром|безум|нельзя|ломается)/i.test(w.replace(/[«»]/g, ""));

export const Captions: React.FC<{ crisis: number }> = ({ crisis }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const idx = chunks.findIndex((c, i) => t >= c.t0 - 0.08 && t < (chunks[i + 1] ? Math.min(chunks[i + 1].t0 - 0.08, c.t1 + 0.6) : c.t1 + 0.8));
  if (idx < 0) return null;
  const c = chunks[idx];
  const startF = Math.round((c.t0 - 0.08) * FPS);
  const s = sp(f, startF, 13, 200);
  const hl = crisis > 0.5 ? C.red : C.cyan;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1390, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 26px",
      transform: `translateY(${(1 - s) * 30}px) scale(${0.9 + 0.1 * s})`, opacity: Math.min(1, s * 1.4) }}>
      {c.words.filter((w) => w.w !== "—").map((w, i) => {
        const active = t >= w.t0 - 0.03;
        const now = t >= w.t0 - 0.03 && t < w.t1 + 0.05;
        const clean = w.w.replace(/[.,:]$/g, "");
        const isAcc = accent(clean);
        return (
          <span key={i} style={{ fontFamily: F.body, fontWeight: 800, fontSize: 66, textTransform: "uppercase", letterSpacing: "0.01em",
            color: active ? (isAcc ? (crisis > 0.5 ? "#ff8095" : C.gold) : "#ffffff") : "rgba(255,255,255,0.35)",
            textShadow: active ? `0 4px 18px rgba(0,0,0,0.9), ${textGlow(isAcc ? (crisis > 0.5 ? C.red : C.gold) : hl, now ? 0.5 : 0.15)}` : "0 4px 18px rgba(0,0,0,0.9)",
            transform: `scale(${now ? 1.04 : 1})`, display: "inline-block", WebkitTextStroke: "1px rgba(0,0,0,0.3)" }}>
            {clean}
          </span>
        );
      })}
    </div>
  );
};
