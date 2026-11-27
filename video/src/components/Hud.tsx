import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F, textGlow } from "../theme";
import { SHOTS, TOTAL_FRAMES } from "../timeline";
import { lerp, sp } from "./anim";

const chapterStarts = SHOTS.filter((s) => s.chapter).map((s) => ({ f: s.start, n: s.chapter![0], name: s.chapter![1] }));

export const Hud: React.FC<{ crisis: number }> = ({ crisis }) => {
  const f = useCurrentFrame();
  const cur = [...chapterStarts].reverse().find((c) => f >= c.f);
  const col = crisis > 0.5 ? C.red : C.cyan;
  const blink = Math.floor(f / 18) % 2 === 0;
  return (
    <>
      {/* progress */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 118, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
        <div style={{ width: `${(f / TOTAL_FRAMES) * 100}%`, height: "100%", background: col, boxShadow: `0 0 12px ${col}`, borderRadius: 2 }} />
        {chapterStarts.map((c) => (
          <div key={c.n} style={{ position: "absolute", left: `${(c.f / TOTAL_FRAMES) * 100}%`, top: -5, width: 3, height: 14, background: f >= c.f ? col : "rgba(255,255,255,0.3)" }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, top: 140, fontFamily: F.mono, fontSize: 24, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(220,230,255,0.75)" }}>
        <span style={{ color: crisis > 0.5 ? C.red : C.red, opacity: blink ? 1 : 0.25 }}>●</span>&nbsp; ДОСЬЕ · О. ТИНЬКОВ
      </div>
      {cur && (
        <div style={{ position: "absolute", right: 60, top: 140, fontFamily: F.mono, fontSize: 24, fontWeight: 700, letterSpacing: "0.2em", color: col, textShadow: textGlow(col, 0.3) }}>
          ГЛ.{String(cur.n).padStart(2, "0")} / {cur.name}
        </div>
      )}
      {/* corner brackets */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[[40, 200, 1, 1], [1040, 200, -1, 1], [40, 1330, 1, -1], [1040, 1330, -1, -1]].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x} ${y + 50 * sy} L${x} ${y} L${x + 50 * sx} ${y}`} stroke={col} strokeOpacity={0.5} strokeWidth={3} fill="none" />
        ))}
      </svg>
    </>
  );
};

/** Big chapter announcement, top of stage. Rendered inside the chapter's first shot. */
export const ChapterCard: React.FC<{ n: number; name: string; color?: string }> = ({ n, name, color = C.cyan }) => {
  const f = useCurrentFrame();
  const out = lerp(f, 48, 60);
  const s = sp(f, 0, 14, 160);
  const w = lerp(f, 2, 18) * 620;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - out,
      transform: `translateY(${-out * 30}px) scale(${(0.85 + 0.15 * s) * (1 - out * 0.25)})` }}>
      <div style={{ fontFamily: F.mono, fontSize: 30, letterSpacing: "0.5em", color, textShadow: textGlow(color, 0.4), fontWeight: 700 }}>ГЛАВА {String(n).padStart(2, "0")}</div>
      <div style={{ width: w, height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, margin: "16px 0", boxShadow: `0 0 16px ${color}` }} />
      <div style={{ fontFamily: F.head, fontSize: name.length > 14 ? 54 : 72, fontWeight: 900, color: "#fff", textShadow: textGlow(color, 0.7), letterSpacing: "0.04em", textAlign: "center" }}>{name}</div>
    </div>
  );
};
