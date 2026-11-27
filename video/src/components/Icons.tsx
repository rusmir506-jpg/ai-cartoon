import React from "react";
import { useCurrentFrame } from "remotion";
import { C, F, glow, textGlow } from "../theme";
import { Draw, lerp, sp } from "./anim";

/** Classical bank building, drawn with neon strokes. Box ~ 600x480 */
export const bankPaths = (w = 600, h = 480) => {
  const cols = 5, cw = w * 0.07, gap = (w * 0.8 - cols * cw) / (cols - 1);
  const p: string[] = [];
  p.push(`M${w * 0.05} ${h * 0.3} L${w / 2} ${h * 0.02} L${w * 0.95} ${h * 0.3} Z`); // roof
  p.push(`M${w * 0.06} ${h * 0.34} L${w * 0.94} ${h * 0.34}`);
  for (let i = 0; i < cols; i++) {
    const x = w * 0.1 + i * (cw + gap);
    p.push(`M${x} ${h * 0.4} L${x} ${h * 0.84} M${x + cw} ${h * 0.4} L${x + cw} ${h * 0.84}`);
  }
  p.push(`M${w * 0.04} ${h * 0.88} L${w * 0.96} ${h * 0.88} M0 ${h * 0.97} L${w} ${h * 0.97}`);
  return p;
};
export const Bank: React.FC<{ at?: number; w?: number; h?: number; color?: string; dur?: number }> = ({ at = 0, w = 600, h = 480, color = C.cyan, dur = 26 }) => (
  <svg width={w} height={h} style={{ overflow: "visible" }}>
    {bankPaths(w, h).map((d, i) => <Draw key={i} d={d} at={at + i * 2} dur={dur} color={color} width={Math.max(2.5, w / 140)} />)}
  </svg>
);

export const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos(a - Math.PI / 2), cy + r * Math.sin(a - Math.PI / 2)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
};

/** Ownership donut; the `share` slice can be pulled out with `pull` 0..1 */
export const Donut: React.FC<{ share: number; at: number; pull?: number; size?: number; color?: string; rest?: string; label?: string }> = ({ share, at, pull = 0, size = 520, color = C.gold, rest = C.blue, label }) => {
  const f = useCurrentFrame();
  const g = lerp(f, at, at + 24);
  const r = size * 0.36, c = size / 2;
  const a = share * Math.PI * 2;
  const mid = a / 2;
  const dx = Math.cos(mid - Math.PI / 2) * pull * 120, dy = Math.sin(mid - Math.PI / 2) * pull * 120;
  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <path d={arc(c, c, r, a + 0.04, a + 0.04 + (Math.PI * 2 - a - 0.08) * g)} stroke={rest} strokeOpacity={0.6} strokeWidth={size * 0.13} fill="none" style={{ filter: glow(rest, 0.6) }} />
      <g transform={`translate(${dx},${dy})`}>
        <path d={arc(c, c, r, 0, Math.max(0.001, a * g))} stroke={color} strokeWidth={size * 0.15} fill="none" style={{ filter: glow(color, 1) }} />
        {label && g > 0.6 && (
          <text x={c + Math.cos(mid - Math.PI / 2) * (r + size * 0.2)} y={c + Math.sin(mid - Math.PI / 2) * (r + size * 0.2) + 16} fill="#fff" fontFamily={F.head} fontWeight={900} fontSize={size * 0.11}
            textAnchor="middle" style={{ filter: glow(color, 0.6) }}>{label}</text>
        )}
      </g>
    </svg>
  );
};

/** Phone frame */
export const Phone: React.FC<{ w?: number; h?: number; children?: React.ReactNode; color?: string }> = ({ w = 440, h = 860, children, color = C.blue }) => (
  <div style={{ width: w, height: h, borderRadius: 64, border: `5px solid ${color}`, boxShadow: `0 0 40px ${color}88, inset 0 0 30px ${color}33`, background: "linear-gradient(180deg,#0b1240,#06071a)", position: "relative", overflow: "hidden" }}>
    <div style={{ position: "absolute", top: 18, left: "50%", width: 130, height: 30, borderRadius: 20, background: "#000", transform: "translateX(-50%)" }} />
    {children}
  </div>
);

/** Generic credit card (no real branding) */
export const CreditCard: React.FC<{ w?: number; label?: string; color?: string; num?: string }> = ({ w = 520, label = "CREDIT", color = C.gold, num = "5536 •••• •••• 2007" }) => {
  const h = w * 0.63;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.06, background: "linear-gradient(135deg,#1b1b2e 0%,#2b2440 45%,#111018 100%)", border: `2px solid ${color}aa`,
      boxShadow: `0 0 40px ${color}55, 0 30px 60px rgba(0,0,0,0.6)`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent 30%, ${color}22 45%, transparent 60%)` }} />
      <div style={{ position: "absolute", left: w * 0.08, top: h * 0.36, width: w * 0.13, height: w * 0.1, borderRadius: 8, background: "linear-gradient(135deg,#f6d77a,#b08a2e)" }} />
      <div style={{ position: "absolute", left: w * 0.08, top: h * 0.1, fontFamily: F.head, fontWeight: 900, fontSize: w * 0.07, color, textShadow: textGlow(color, 0.4) }}>{label}</div>
      <div style={{ position: "absolute", left: w * 0.08, bottom: h * 0.14, fontFamily: F.mono, fontSize: w * 0.055, color: "#fff", letterSpacing: "0.08em" }}>{num}</div>
      <svg style={{ position: "absolute", right: w * 0.08, top: h * 0.33 }} width={w * 0.1} height={w * 0.1} viewBox="0 0 40 40">
        {[8, 16, 24].map((r) => <path key={r} d={arc(0, 20, r, Math.PI * 0.2, Math.PI * 0.8)} stroke="#fff" strokeWidth={3} fill="none" opacity={0.8} />)}
      </svg>
    </div>
  );
};

/** Day calendar tile */
export const CalTile: React.FC<{ month: string; day: string | number; color?: string; w?: number }> = ({ month, day, color = C.red, w = 300 }) => (
  <div style={{ width: w, borderRadius: 30, overflow: "hidden", border: `3px solid ${color}`, boxShadow: `0 0 40px ${color}66`, background: "rgba(10,10,30,0.9)" }}>
    <div style={{ background: color, color: "#fff", fontFamily: F.mono, fontWeight: 700, fontSize: w * 0.1, textAlign: "center", padding: "10px 0", letterSpacing: "0.15em" }}>{month}</div>
    <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: w * 0.42, color: "#fff", textAlign: "center", padding: "10px 0 18px", textShadow: textGlow(color, 0.5) }}>{day}</div>
  </div>
);

/** Rising/falling line chart drawn progressively */
export const LineChart: React.FC<{ pts: number[]; at: number; dur?: number; w?: number; h?: number; color?: string; crashAt?: number }> = ({ pts, at, dur = 40, w = 860, h = 420, color = C.green }) => {
  const f = useCurrentFrame();
  const p = lerp(f, at, at + dur, 0, 1);
  const max = Math.max(...pts), min = Math.min(...pts);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * w, h - ((v - min) / (max - min || 1)) * h * 0.9 - h * 0.05]);
  const n = p * (pts.length - 1);
  const shown = xy.slice(0, Math.floor(n) + 1);
  const k = Math.floor(n);
  if (k < pts.length - 1) {
    const t = n - k; shown.push([xy[k][0] + (xy[k + 1][0] - xy[k][0]) * t, xy[k][1] + (xy[k + 1][1] - xy[k][1]) * t]);
  }
  const d = "M" + shown.map((q) => q.join(",")).join(" L");
  const head = shown[shown.length - 1];
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={C.line} strokeDasharray="4 8" />)}
      <path d={`${d} L${head[0]},${h} L0,${h} Z`} fill={color} fillOpacity={0.12} />
      <path d={d} stroke={color} strokeWidth={6} fill="none" strokeLinejoin="round" style={{ filter: glow(color, 1) }} />
      <circle cx={head[0]} cy={head[1]} r={12} fill="#fff" style={{ filter: glow(color, 1.5) }} />
    </svg>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; color?: string; at?: number; size?: number }> = ({ children, color = C.cyan, at = 0, size = 30 }) => {
  const f = useCurrentFrame();
  const s = sp(f, at, 14, 180);
  return (
    <div style={{ display: "inline-block", padding: "12px 24px", borderRadius: 999, border: `2px solid ${color}`, background: `${color}1a`, color: "#fff", fontFamily: F.mono, fontWeight: 700,
      fontSize: size, letterSpacing: "0.1em", boxShadow: `0 0 24px ${color}55`, opacity: Math.min(1, s * 1.3), transform: `scale(${0.6 + 0.4 * s})`, whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};
