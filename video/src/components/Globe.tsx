import React, { useMemo } from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate, GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import world from "world-atlas/countries-110m.json";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { C, F, glow, textGlow } from "../theme";
import { lerp } from "./anim";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const countries = (feature(world as any, (world as any).objects.countries) as any).features as any[];
const grat = geoGraticule10();

export const PLACES: Record<string, [number, number]> = {
  polysaevo: [86.3, 54.6], spb: [30.3, 59.94], singapore: [103.82, 1.35], moscow: [37.62, 55.75], london: [-0.13, 51.5], mexico: [-99.13, 19.43],
};

export type Key = { f: number; lon: number; lat: number; scale: number };
type Marker = { at: [number, number]; label: string; f: number; color?: string; dx?: number; dy?: number };
type Route = { from: [number, number]; to: [number, number]; f0: number; f1: number; color?: string; vehicle?: boolean };

export const Globe: React.FC<{ keys: Key[]; highlight?: string[]; markers?: Marker[]; routes?: Route[]; size?: number; cx?: number; cy?: number; hl?: string }> = ({
  keys, highlight = [], markers = [], routes = [], size = 1080, cx = 540, cy = 820, hl = C.cyan,
}) => {
  const f = useCurrentFrame();
  const fs = keys.map((k) => k.f);
  const ease = Easing.bezier(0.65, 0, 0.35, 1);
  const val = (sel: (k: Key) => number) => (keys.length === 1 ? sel(keys[0]) : interpolate(f, fs, keys.map(sel), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const lon = val((k) => k.lon), lat = val((k) => k.lat), scale = val((k) => k.scale);
  const proj: GeoProjection = geoOrthographic().translate([size / 2, size / 2]).scale(scale).rotate([-lon, -lat]).clipAngle(90);
  const path = geoPath(proj);
  const sphere = path({ type: "Sphere" }) ?? "";
  const hlSet = useMemo(() => new Set(highlight), [highlight]);
  const visible = (p: [number, number]) => {
    const r = proj.rotate();
    const d = geoInterpolate([-r[0], -r[1]], p);
    void d;
    const c = proj(p);
    // angular distance check
    const toRad = Math.PI / 180;
    const [l1, p1] = [-r[0] * toRad, -r[1] * toRad], [l2, p2] = [p[0] * toRad, p[1] * toRad];
    const cos = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(l2 - l1);
    return cos > 0.05 && c ? c : null;
  };
  return (
    <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size }}>
      <svg width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="gl" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#1b2d7a" stopOpacity="0.85" /><stop offset="0.7" stopColor="#0a0f35" stopOpacity="0.9" /><stop offset="1" stopColor="#050720" stopOpacity="1" />
          </radialGradient>
        </defs>
        <path d={sphere} fill="url(#gl)" stroke={C.blue} strokeWidth={2.5} style={{ filter: glow(C.blue, 1.2) }} />
        <path d={path(grat) ?? ""} fill="none" stroke={C.blue} strokeOpacity={0.18} strokeWidth={1} />
        {countries.map((c) => {
          const on = hlSet.has(c.id);
          return <path key={c.id + (c.properties?.name ?? "")} d={path(c) ?? ""} fill={on ? hl : "#4d7cff"} fillOpacity={on ? 0.13 : 0.06} stroke={on ? hl : "#7fa0ff"} strokeOpacity={on ? 1 : 0.45} strokeWidth={on ? 2.5 : 1}
            style={on ? { filter: glow(hl, 0.8) } : undefined} />;
        })}
        {routes.map((r, i) => {
          const p = lerp(f, r.f0, r.f1, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
          if (p <= 0) return null;
          const interp = geoInterpolate(r.from, r.to);
          const n = 60;
          const pts: [number, number][] = [];
          for (let k = 0; k <= n * p; k++) {
            const g = interp(k / n);
            const c = visible(g as [number, number]);
            if (c) {
              // lift arc above surface
              const lift = Math.sin((k / n) * Math.PI) * 0.12;
              pts.push([size / 2 + (c[0] - size / 2) * (1 + lift), size / 2 + (c[1] - size / 2) * (1 + lift)]);
            }
          }
          if (pts.length < 2) return null;
          const d = "M" + pts.map((q) => q.join(",")).join(" L");
          const head = pts[pts.length - 1];
          const col = r.color ?? C.gold;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={col} strokeWidth={5} strokeLinecap="round" style={{ filter: glow(col, 1) }} />
              <path d={d} fill="none" stroke="#fff" strokeWidth={1.6} strokeDasharray="6 10" strokeDashoffset={-f * 2} />
              {p < 1 && <circle cx={head[0]} cy={head[1]} r={10} fill="#fff" style={{ filter: glow(col, 1.4) }} />}
            </g>
          );
        })}
        {markers.map((m, i) => {
          const c = visible(m.at);
          if (!c || f < m.f) return null;
          const t = f - m.f;
          const s = Math.min(1, t / 8);
          const col = m.color ?? C.gold;
          const ring = (t % 40) / 40;
          return (
            <g key={i} transform={`translate(${c[0]},${c[1]})`}>
              <circle r={10 + ring * 50} fill="none" stroke={col} strokeWidth={3} opacity={1 - ring} />
              <circle r={11 * s} fill={col} style={{ filter: glow(col, 1.3) }} />
              <circle r={4 * s} fill="#fff" />
            </g>
          );
        })}
      </svg>
      {markers.map((m, i) => {
        const c = visible(m.at);
        if (!c || f < m.f + 4) return null;
        const o = lerp(f, m.f + 4, m.f + 14);
        const col = m.color ?? C.gold;
        return (
          <div key={i} style={{ position: "absolute", left: c[0] + (m.dx ?? 30), top: c[1] + (m.dy ?? -70), opacity: o, transform: `translateX(${(1 - o) * -20}px)`,
            fontFamily: F.mono, fontWeight: 700, fontSize: 30, color: "#fff", whiteSpace: "nowrap", padding: "8px 16px", borderLeft: `4px solid ${col}`,
            background: "rgba(5,8,30,0.75)", textShadow: textGlow(col, 0.3), letterSpacing: "0.08em" }}>
            {m.label}
          </div>
        );
      })}
    </div>
  );
};
