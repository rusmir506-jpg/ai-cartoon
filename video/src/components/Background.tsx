import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { rnd } from "./anim";

/** Dark animated gradient + perspective grid + particles + grain + vignette. `crisis` 0..1 shifts to red. */
export const Background: React.FC<{ crisis: number; hue: number }> = ({ crisis, hue }) => {
  const f = useCurrentFrame();
  const t = f / 30;
  const a = `rgba(${Math.round(40 + 160 * crisis)},${Math.round(60 - 40 * crisis)},${Math.round(200 - 150 * crisis)},0.55)`;
  const b = `rgba(${Math.round(120 + 80 * crisis)},${Math.round(40 - 20 * crisis)},${Math.round(200 - 140 * crisis)},0.45)`;
  const x1 = 30 + 20 * Math.sin(t * 0.21 + hue), y1 = 25 + 12 * Math.cos(t * 0.17);
  const x2 = 70 + 18 * Math.cos(t * 0.15 + hue), y2 = 75 + 10 * Math.sin(t * 0.19);
  return (
    <AbsoluteFill style={{ background: C.bg0, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 45% at ${x1}% ${y1}%, ${a}, transparent 70%), radial-gradient(55% 45% at ${x2}% ${y2}%, ${b}, transparent 70%), linear-gradient(180deg, #050716 0%, #0a0b24 50%, #05040f 100%)` }} />
      {/* perspective grid floor */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        <defs>
          <linearGradient id="gfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="1" /><stop offset="0.55" stopColor="#000" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 23 }).map((_, i) => {
          const x = (i - 11) * 160;
          return <line key={"v" + i} x1={540 + x * 0.15} y1={1180} x2={540 + x * 2.2} y2={1920} stroke={crisis > 0.5 ? C.red : C.blue} strokeWidth={1.5} opacity={0.5} />;
        })}
        {Array.from({ length: 14 }).map((_, i) => {
          const p = ((i + (t * 0.35) % 1) / 14);
          const y = 1180 + Math.pow(p, 2.2) * 740;
          return <line key={"h" + i} x1={0} x2={1080} y1={y} y2={y} stroke={crisis > 0.5 ? C.red : C.violet} strokeWidth={1.2} opacity={0.15 + p * 0.6} />;
        })}
        {/* top faint grid */}
        {Array.from({ length: 10 }).map((_, i) => <line key={"t" + i} x1={i * 120} x2={i * 120} y1={0} y2={1100} stroke={C.line} strokeWidth={1} opacity={0.25} />)}
        {Array.from({ length: 10 }).map((_, i) => <line key={"u" + i} y1={i * 120} y2={i * 120} x1={0} x2={1080} stroke={C.line} strokeWidth={1} opacity={0.2} />)}
      </svg>
      {/* particles */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => {
          const sp = 8 + rnd(i) * 30;
          const x = (rnd(i + 99) * 1080 + Math.sin(t * 0.3 + i) * 30) % 1080;
          const y = ((rnd(i + 7) * 2100 - t * sp) % 2100 + 2100) % 2100 - 90;
          const r = 0.8 + rnd(i + 3) * 2.4;
          const o = 0.2 + 0.6 * Math.abs(Math.sin(t * (0.5 + rnd(i)) + i));
          return <circle key={i} cx={x} cy={y} r={r} fill={i % 3 ? (crisis > 0.5 ? "#ff8899" : "#9fdcff") : "#c9a6ff"} opacity={o} />;
        })}
      </svg>
      {/* scan line sweep */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent ${((t * 12) % 140) - 20}%, rgba(120,180,255,0.05) ${((t * 12) % 140) - 18}%, transparent ${((t * 12) % 140) - 16}%)` }} />
      <AbsoluteFill style={{ opacity: interpolate(crisis, [0, 1], [0, 0.18]), background: "radial-gradient(70% 50% at 50% 45%, rgba(255,40,70,0.6), transparent 70%)" }} />
    </AbsoluteFill>
  );
};

export const Overlay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "screen" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 12} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.4 -0.2" /></filter>
        <rect width="1080" height="1920" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(120% 75% at 50% 45%, transparent 55%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};
