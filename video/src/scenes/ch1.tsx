import React from "react";
import { AbsoluteFill } from "remotion";
import { Abs, Counter, Label, Neon, Pop, Card, Draw, lerp, sp, useShot, rnd } from "../components/anim";
import { Globe, PLACES } from "../components/Globe";
import { Chip } from "../components/Icons";
import { C, F, glow } from "../theme";

export const MapHome: React.FC = () => {
  const { cue, f } = useShot();
  const p = cue("полысаево", 18);
  return (
    <AbsoluteFill>
      <Globe cy={880} size={980} highlight={["643"]} keys={[{ f: 0, lon: 50, lat: 30, scale: 330 }, { f: p + 4, lon: 86, lat: 52, scale: 900 }, { f: p + 200, lon: 88, lat: 52, scale: 980 }]}
        markers={[{ at: PLACES.polysaevo, label: "ПОЛЫСАЕВО · КУЗБАСС", f: p + 2, dx: -200, dy: -110 }]} />
      <Abs x={540} y={1250}><Pop at={cue("кузбасс", 40)}><Chip color={C.gold}>РОДИЛСЯ В 1967</Chip></Pop></Abs>
      <Abs x={540} y={560}><div style={{ opacity: lerp(f, 40, 50) }}><Label color={C.dim} size={26}>КЕМЕРОВСКАЯ ОБЛАСТЬ · СССР</Label></div></Abs>
    </AbsoluteFill>
  );
};

export const Miner: React.FC = () => {
  const { f, cue } = useShot();
  const w = cue("шахтёра", 8);
  const helmet = "M300 380 C300 250 380 190 460 190 C540 190 620 250 620 380 Z M270 380 L650 380 L650 410 L270 410 Z";
  return (
    <AbsoluteFill>
      <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 260 }}>
        {/* lamp beam */}
        <path d={`M460 250 L${140 + Math.sin(f / 15) * 40} 900 L${780 + Math.sin(f / 15) * 40} 900 Z`} fill="url(#beam)" opacity={lerp(f, 10, 20) * 0.8} />
        <defs><linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.gold} stopOpacity="0.55" /><stop offset="1" stopColor={C.gold} stopOpacity="0" /></linearGradient></defs>
        <g transform="translate(80,0)">
          <Draw d={helmet} at={0} dur={22} color={C.gold} width={6} />
          <circle cx={460} cy={250} r={34 * sp(f, 12)} fill="#fff" style={{ filter: glow(C.gold, 2) }} />
        </g>
        {/* pickaxe */}
        <g transform={`translate(760,470) rotate(${-20 + Math.sin(f / 10) * 6})`}>
          <Draw d="M0 0 L0 300" at={8} dur={16} color={C.cyan} width={10} />
          <Draw d="M-140 20 C-60 -40 60 -40 140 20" at={12} dur={16} color={C.cyan} width={10} />
        </g>
        {/* coal particles */}
        {Array.from({ length: 26 }).map((_, i) => (
          <rect key={i} x={100 + rnd(i) * 880} y={((rnd(i + 3) * 900 + f * (2 + rnd(i) * 3)) % 900) + 100} width={8 + rnd(i + 1) * 12} height={8 + rnd(i + 2) * 12}
            fill="#8fa0d0" opacity={0.25} transform={`rotate(${f + i * 30})`} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        ))}
        {/* rail + cart */}
        <Draw d="M0 860 L1080 860" at={4} dur={20} color={C.violet} width={4} />
        <g transform={`translate(${-260 + lerp(f, 6, 70) * 560},760)`}>
          <Draw d="M0 0 L240 0 L210 90 L30 90 Z" at={6} dur={14} color={C.violet} width={6} />
          {[60, 180].map((x) => <circle key={x} cx={x} cy={104} r={18} fill="none" stroke={C.violet} strokeWidth={6} style={{ filter: glow(C.violet, 0.6) }} />)}
          {[30, 80, 130, 170].map((x, i) => <circle key={i} cx={x + 20} cy={-12 + (i % 2) * 8} r={26} fill="#1c2240" stroke="#5a6aa8" strokeWidth={2} />)}
        </g>
      </svg>
      <Abs x={540} y={1240}><Pop at={w}><Neon size={76} color={C.gold}>СЫН ШАХТЁРА</Neon></Pop></Abs>
    </AbsoluteFill>
  );
};

export const BikeArmy: React.FC = () => {
  const { f, cue } = useShot();
  const army = cue("армия", 18);
  const out = lerp(f, army - 4, army + 6);
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy={300} r={120} fill="none" stroke={C.cyan} strokeWidth={8} style={{ filter: glow(C.cyan, 0.8) }} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + f / 4;
        return <line key={i} x1={cx} y1={300} x2={cx + Math.cos(a) * 118} y2={300 + Math.sin(a) * 118} stroke={C.cyan} strokeOpacity={0.5} strokeWidth={2} />;
      })}
    </g>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 380, width: 1080, opacity: 1 - out, transform: `translateX(${-out * 400}px)` }}>
        <svg width={1080} height={600}>
          {Array.from({ length: 10 }).map((_, i) => {
            const y = 120 + i * 40, x = ((rnd(i) * 1080 - f * 40) % 1200 + 1200) % 1200 - 100;
            return <line key={i} x1={x} x2={x + 160} y1={y} y2={y} stroke={C.blue} strokeOpacity={0.5} strokeWidth={3} />;
          })}
          {wheel(270)}{wheel(810)}
          <Draw d="M270 300 L450 120 L740 120 L810 300 M450 120 L540 300 L740 120 M540 300 L270 300 M430 90 L490 90 M740 120 L720 70 L780 60" at={0} dur={20} color={C.gold} width={9} />
        </svg>
        <div style={{ textAlign: "center", marginTop: 10 }}><Neon size={84} color={C.cyan}>ВЕЛОСПОРТ</Neon></div>
      </div>
      <Abs x={540} y={760}>
        <Pop at={army - 2} from={0.3}>
          <svg width={420} height={460} style={{ overflow: "visible" }}>
            <Draw d="M210 10 L400 80 L380 300 C360 380 280 430 210 450 C140 430 60 380 40 300 L20 80 Z" at={army - 2} dur={18} color={C.green} width={7} />
            <Draw d="M210 110 L240 195 L330 195 L258 248 L285 335 L210 283 L135 335 L162 248 L90 195 L180 195 Z" at={army + 4} dur={18} color={C.gold} width={6} fill={C.gold} fillAt={army + 18} />
          </svg>
          <div style={{ textAlign: "center", marginTop: 20 }}><Neon size={84} color={C.green}>АРМИЯ</Neon></div>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const MapLeningrad: React.FC = () => {
  const { cue } = useShot();
  const y = cue("восемьдесят", 6);
  const l = cue("ленинградский", 40);
  const g = cue("горный", 60);
  return (
    <AbsoluteFill>
      <Globe cy={820} size={980} highlight={["643"]} keys={[{ f: 0, lon: 86, lat: 52, scale: 900 }, { f: l, lon: 56, lat: 58, scale: 760 }, { f: l + 80, lon: 52, lat: 58, scale: 800 }]}
        routes={[{ from: PLACES.polysaevo, to: PLACES.spb, f0: y, f1: l + 6 }]}
        markers={[{ at: PLACES.polysaevo, label: "КУЗБАСС", f: 0, dx: -80, dy: 30 }, { at: PLACES.spb, label: "ЛЕНИНГРАД", f: l, dx: -40, dy: -110, color: C.cyan }]} />
      <Abs x={540} y={330}><Pop at={y}><Counter from={1967} to={1988} at={y} dur={22} size={120} color={C.gold} /></Pop></Abs>
      <Abs x={540} y={1240}>
        <Pop at={g}>
          <Card color={C.cyan} pad={24} style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <svg width={80} height={70}>{[10, 28, 46, 64].map((x) => <rect key={x} x={x - 4} y={18} width={8} height={42} fill={C.cyan} />)}<path d="M0 16 L40 0 L80 16 Z" fill={C.cyan} /><rect x={0} y={62} width={80} height={6} fill={C.cyan} /></svg>
            <div style={{ fontFamily: F.head, fontWeight: 700, fontSize: 32, color: "#fff", lineHeight: 1.2 }}>ЛЕНИНГРАДСКИЙ<br />ГОРНЫЙ ИНСТИТУТ</div>
          </Card>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const Trade: React.FC = () => {
  const { f, cue } = useShot();
  const tr = cue("торговля", 20);
  const def = cue("дефицит", 50);
  const dor = cue("дороже", 100);
  const items = ["ТОВАР", "ДЕФИЦИТ", "ТОВАР", "ДЕФИЦИТ", "ТОВАР", "ДЕФИЦИТ"];
  return (
    <AbsoluteFill>
      <Abs x={540} y={360}><Pop at={0}><Label size={30} color={C.dim}>ВМЕСТО УЧЁБЫ</Label></Pop></Abs>
      <Abs x={540} y={460}><Pop at={tr}><Neon size={96} color={C.gold}>ТОРГОВЛЯ</Neon></Pop></Abs>
      {/* conveyor of boxes */}
      <svg width={1080} height={300} style={{ position: "absolute", left: 0, top: 560 }}>
        <Draw d="M40 230 L1040 230" at={tr} dur={14} color={C.violet} width={5} />
        {items.map((t, i) => {
          const x = ((i * 220 + f * 6) % 1320) - 200;
          const hot = i % 2 === 1 && f > def;
          return (
            <g key={i} transform={`translate(${x},110)`} opacity={lerp(f, tr + i * 2, tr + i * 2 + 6)}>
              <rect width={170} height={110} rx={12} fill={hot ? "rgba(255,216,77,0.15)" : "rgba(77,124,255,0.12)"} stroke={hot ? C.gold : C.blue} strokeWidth={4} style={{ filter: glow(hot ? C.gold : C.blue, 0.5) }} />
              <path d="M0 35 L170 35 M85 0 L85 35" stroke={hot ? C.gold : C.blue} strokeWidth={3} />
              <text x={85} y={85} textAnchor="middle" fill="#fff" fontFamily={F.mono} fontWeight={700} fontSize={22}>{t}</text>
            </g>
          );
        })}
      </svg>
      {/* buy / sell bars */}
      <Abs x={540} y={1100}>
        <div style={{ display: "flex", gap: 90, alignItems: "flex-end", height: 330 }}>
          {[{ l: "КУПИЛ", h: 110, c: C.blue, at: def }, { l: "ПРОДАЛ", h: 300, c: C.green, at: dor - 4 }].map((b) => (
            <div key={b.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ width: 150, height: b.h * sp(f, b.at, 14, 100), background: `linear-gradient(180deg, ${b.c}, ${b.c}33)`, borderRadius: 14, boxShadow: `0 0 30px ${b.c}88` }} />
              <Label color={b.c} size={28}>{b.l}</Label>
            </div>
          ))}
          <div style={{ position: "absolute", right: -120, top: 0, opacity: lerp(f, dor, dor + 8) }}><Neon size={90} color={C.green}>↑</Neon></div>
        </div>
      </Abs>
    </AbsoluteFill>
  );
};
