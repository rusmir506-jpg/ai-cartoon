import React, { createContext, useContext } from "react";
import { interpolate, spring, useCurrentFrame, Easing } from "remotion";
import { C, F, glow, textGlow } from "../theme";
import type { Shot } from "../timeline";
import { norm } from "../timeline";

export const ShotCtx = createContext<Shot | null>(null);
export const useShot = () => {
  const shot = useContext(ShotCtx)!;
  const f = useCurrentFrame();
  const dur = shot.end - shot.start;
  /** frame (relative to shot) where cue word is spoken; fallback provided */
  const cue = (w: string, fallback = 0) => {
    const k = norm(w);
    if (k in shot.cues) return shot.cues[k];
    const hit = Object.keys(shot.cues).find((x) => x.startsWith(k));
    return hit ? shot.cues[hit] : fallback;
  };
  return { f, dur, cue, shot };
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lerp = (f: number, a: number, b: number, from = 0, to = 1, ease = Easing.bezier(0.22, 1, 0.36, 1)) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: ease });
export const sp = (f: number, at: number, damping = 14, stiffness = 140, mass = 0.8) =>
  spring({ frame: f - at, fps: 30, config: { damping, stiffness, mass } });

/** Spring pop-in with blur */
export const Pop: React.FC<{ at?: number; from?: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; damping?: number }> = ({
  at = 0, from = 0.5, children, style, y = 0, damping = 12,
}) => {
  const f = useCurrentFrame();
  const s = sp(f, at, damping);
  const o = lerp(f, at, at + 6);
  return (
    <div style={{ ...style, opacity: o, transform: `${style?.transform ?? ""} translateY(${(1 - s) * y}px) scale(${from + (1 - from) * s})`, filter: `blur(${(1 - o) * 10}px)` }}>
      {children}
    </div>
  );
};

export const Abs: React.FC<{ x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; center?: boolean }> = ({ x, y, children, style, center = true }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: center ? "translate(-50%,-50%)" : undefined, ...style }}>{children}</div>
);

export const Neon: React.FC<{ children: React.ReactNode; size?: number; color?: string; font?: string; weight?: number; style?: React.CSSProperties; flicker?: number }> = ({
  children, size = 80, color = C.cyan, font = F.head, weight = 800, style, flicker,
}) => {
  const f = useCurrentFrame();
  let o = 1;
  if (flicker !== undefined) {
    const t = f - flicker;
    o = t < 0 ? 0 : t < 14 ? ([1, 0.2, 1, 0.1, 0.9, 1, 0.3, 1, 1, 0.6, 1, 1, 1, 1][t] ?? 1) : 1;
  }
  return (
    <div style={{ fontFamily: font, fontWeight: weight, fontSize: size, color: "#fff", textShadow: textGlow(color, size / 80), letterSpacing: "0.02em", lineHeight: 1.05, whiteSpace: "nowrap", opacity: o, ...style }}>
      {children}
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.cyan, size = 26, style }) => (
  <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: size, color, letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap", textShadow: textGlow(color, 0.4), ...style }}>
    {children}
  </div>
);

/** Animated number */
export const Counter: React.FC<{ from?: number; to: number; at: number; dur?: number; fmt?: (n: number) => string; size?: number; color?: string; font?: string; style?: React.CSSProperties }> = ({
  from = 0, to, at, dur = 30, fmt = (n) => Math.round(n).toString(), size = 140, color = C.cyan, font = F.head, style,
}) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [from, to], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const settle = sp(f, at + dur - 4, 8, 200);
  return (
    <Neon size={size} color={color} font={font} style={{ transform: `scale(${1 + 0.06 * Math.sin(Math.min(1, settle) * Math.PI)})`, fontVariantNumeric: "tabular-nums", ...style }}>
      {fmt(v)}
    </Neon>
  );
};

/** Stroke-draw path */
export const Draw: React.FC<{ d: string; at?: number; dur?: number; color?: string; width?: number; fill?: string; fillAt?: number; dash?: boolean; opacity?: number }> = ({
  d, at = 0, dur = 20, color = C.cyan, width = 4, fill = "none", fillAt, dash, opacity = 1,
}) => {
  const f = useCurrentFrame();
  const p = lerp(f, at, at + dur, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
  const fo = fillAt !== undefined ? lerp(f, fillAt, fillAt + 12) : 0;
  return (
    <path d={d} pathLength={1} fill={fill} fillOpacity={fo} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray={dash ? "0.012 0.012" : "1 1"} strokeDashoffset={dash ? 0 : 1 - p} opacity={dash ? p * opacity : opacity * (p > 0 ? 1 : 0)}
      style={{ filter: glow(color, 0.6) }} />
  );
};

/** Big rubber stamp */
export const Stamp: React.FC<{ at: number; text: string; color?: string; rot?: number; size?: number; style?: React.CSSProperties }> = ({ at, text, color = C.red, rot = -12, size = 64, style }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const s = sp(f, at, 9, 260);
  const shake = f - at < 8 ? Math.sin((f - at) * 3) * (8 - (f - at)) : 0;
  return (
    <div style={{ display: "inline-block", border: `6px solid ${color}`, borderRadius: 14, padding: "10px 28px", fontFamily: F.head, fontWeight: 900, fontSize: size, color,
      textShadow: textGlow(color, 0.5), boxShadow: `0 0 30px ${color}66, inset 0 0 30px ${color}33`, transform: `rotate(${rot}deg) scale(${2.4 - 1.4 * s}) translateX(${shake}px)`,
      opacity: Math.min(1, s * 1.5), whiteSpace: "nowrap", letterSpacing: "0.05em", ...style }}>
      {text}
    </div>
  );
};

/** Glass UI card */
export const Card: React.FC<{ children: React.ReactNode; w?: number; h?: number; color?: string; style?: React.CSSProperties; pad?: number }> = ({ children, w, h, color = C.blue, style, pad = 36 }) => (
  <div style={{ width: w, height: h, padding: pad, borderRadius: 34, background: "linear-gradient(160deg, rgba(40,55,130,0.55), rgba(15,12,45,0.75))",
    border: `2px solid ${color}88`, boxShadow: `0 0 40px ${color}44, inset 0 0 40px ${color}1f, 0 30px 80px rgba(0,0,0,0.6)`, backdropFilter: "blur(10px)", boxSizing: "border-box", ...style }}>
    {children}
  </div>
);

export const Typer: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties }> = ({ text, at, cps = 40, style }) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor(((f - at) / 30) * cps));
  const caret = f >= at && n < text.length + 8 && Math.floor(f / 8) % 2 === 0;
  return <span style={style}>{text.slice(0, n)}<span style={{ opacity: caret ? 1 : 0 }}>▌</span></span>;
};

/** deterministic random */
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
