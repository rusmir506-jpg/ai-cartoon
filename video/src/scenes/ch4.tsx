import React from "react";
import { AbsoluteFill } from "remotion";
import { Abs, Counter, Label, Neon, Pop, Card, lerp, sp, useShot, rnd } from "../components/anim";
import { Globe, PLACES } from "../components/Globe";
import { Chip, LineChart } from "../components/Icons";
import { C, F, glow, textGlow } from "../theme";

export const Year2013: React.FC = () => {
  const { f } = useShot();
  return (
    <AbsoluteFill>
      <Abs x={540} y={1000}>
        <div style={{ display: "flex", gap: 26, alignItems: "flex-end", height: 360, opacity: 0.55 }}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ width: 70, height: (60 + i * 38) * sp(f, 4 + i * 2, 14, 120), background: `linear-gradient(180deg, ${C.cyan}, transparent)`, borderRadius: 10 }} />)}
        </div>
      </Abs>
      <Abs x={540} y={760}><Counter from={2006} to={2013} at={4} dur={24} size={230} color={C.gold} /></Abs>
    </AbsoluteFill>
  );
};

export const MapLondon: React.FC = () => {
  const { f, cue } = useShot();
  const l = cue("лондоне", 12);
  const tape = "TCS GROUP · IPO · LSE · OCT 2013 · ▲ · ";
  return (
    <AbsoluteFill>
      <Globe cy={780} size={960} highlight={["826"]} keys={[{ f: 0, lon: 37, lat: 50, scale: 600 }, { f: l + 4, lon: 0, lat: 51, scale: 1300 }, { f: l + 90, lon: -1, lat: 51, scale: 1400 }]}
        markers={[{ at: PLACES.london, label: "ЛОНДОН · LSE", f: l, color: C.gold, dx: 30, dy: -90 }]} routes={[{ from: PLACES.moscow, to: PLACES.london, f0: 0, f1: l + 2 }]} />
      <Abs x={540} y={330}><Pop at={0}><Neon size={120} color={C.cyan}>IPO</Neon></Pop></Abs>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, height: 76, overflow: "hidden", borderTop: `2px solid ${C.gold}`, borderBottom: `2px solid ${C.gold}`, background: "rgba(255,216,77,0.08)" }}>
        <div style={{ whiteSpace: "nowrap", fontFamily: F.mono, fontWeight: 700, fontSize: 38, color: C.gold, lineHeight: "76px", transform: `translateX(${-((f * 6) % 900)}px)`, textShadow: textGlow(C.gold, 0.3) }}>
          {tape.repeat(6)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Valuation: React.FC = () => {
  const { f, cue } = useShot();
  const t = cue("три", 30);
  return (
    <AbsoluteFill>
      <Abs x={540} y={380}><Pop at={0}><Label size={30} color={C.dim}>ОЦЕНКА НА IPO · 2013</Label></Pop></Abs>
      <Abs x={540} y={560}><Pop at={t - 6}><Counter from={0} to={3.2} at={t - 4} dur={36} size={118} color={C.green} fmt={(n) => `$${n.toFixed(1).replace(".", ",")} МЛРД`} /></Pop></Abs>
      <Abs x={540} y={950}><LineChart pts={[1, 1.4, 1.2, 1.9, 2.2, 2.0, 2.8, 3.3, 3.1, 4.2]} at={4} dur={60} w={880} h={380} /></Abs>
      <Abs x={540} y={1240}><Pop at={t + 26}><Chip color={C.cyan}>ПРИВЛЕЧЕНО ≈$1,1 МЛРД</Chip></Pop></Abs>
    </AbsoluteFill>
  );
};

export const Wealth: React.FC = () => {
  const { f, cue } = useShot();
  const n = cue("четыре", 80);
  return (
    <AbsoluteFill>
      {/* coin stacks */}
      <Abs x={540} y={1060}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
          {[5, 8, 12, 9, 6].map((h, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column-reverse" }}>
              {Array.from({ length: h }).map((_, k) => {
                const at = 6 + i * 3 + k * 2;
                return <div key={k} style={{ width: 120, height: 22, marginTop: -4, borderRadius: "50%", background: "linear-gradient(180deg,#ffe78a,#b58a1a)", border: "2px solid #fff3c0",
                  boxShadow: `0 0 12px ${C.gold}66`, opacity: lerp(f, at, at + 3), transform: `translateY(${(1 - sp(f, at, 12, 220)) * -80}px)` }} />;
              })}
            </div>
          ))}
        </div>
      </Abs>
      <Abs x={540} y={460}>
        <Pop at={0}>
          <Card color={C.gold} w={940} pad={34} style={{ textAlign: "center" }}>
            <Label size={26} color={C.gold}>СОСТОЯНИЕ · ОЦЕНКА FORBES · 2021</Label>
            <div style={{ marginTop: 16 }}><Counter from={0} to={4.7} at={8} dur={n + 20} size={108} color={C.gold} fmt={(v) => `$${v.toFixed(1).replace(".", ",")} МЛРД`} /></div>
          </Card>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const Persona: React.FC = () => {
  const { f, cue } = useShot();
  const words = [
    { t: "ДЕРЗКИЙ", at: 2, x: 340, y: 460, c: C.magenta, r: -6 },
    { t: "ГРОМКИЙ", at: cue("громкий", 14), x: 760, y: 600, c: C.cyan, r: 5 },
    { t: "ЛИЦО БРЕНДА", at: cue("лицом", 40), x: 540, y: 1200, c: C.gold, r: 0 },
  ];
  return (
    <AbsoluteFill>
      {/* spotlight */}
      <svg width={1080} height={1400} style={{ position: "absolute", left: 0, top: 200 }}>
        <defs><linearGradient id="spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <path d={`M540 0 L${300 + Math.sin(f / 20) * 30} 1000 L${780 + Math.sin(f / 20) * 30} 1000 Z`} fill="url(#spot)" opacity={lerp(f, 0, 10)} />
        {/* microphone */}
        <g transform="translate(540,640)">
          <rect x={-55} y={-150} width={110} height={190} rx={55} fill="none" stroke="#fff" strokeWidth={7} style={{ filter: glow(C.cyan, 0.8) }} />
          {[-100, -60, -20].map((y) => <line key={y} x1={-40} x2={40} y1={y} y2={y} stroke="#fff" strokeOpacity={0.5} strokeWidth={4} />)}
          <path d="M-90 0 C-90 110 90 110 90 0 M0 95 L0 190 M-60 190 L60 190" fill="none" stroke="#fff" strokeWidth={7} style={{ filter: glow(C.cyan, 0.8) }} />
          {[0, 1, 2].map((i) => { const r = ((f * 1.5 + i * 30) % 90) / 90; return <circle key={i} r={140 + r * 260} fill="none" stroke={C.cyan} strokeWidth={3} opacity={(1 - r) * 0.6} />; })}
        </g>
      </svg>
      {words.map((w) => (
        <Abs key={w.t} x={w.x} y={w.y}><Pop at={w.at} from={1.8} damping={10}><div style={{ transform: `rotate(${w.r}deg)` }}><Neon size={w.t.length > 8 ? 70 : 72} color={w.c}>{w.t}</Neon></div></Pop></Abs>
      ))}
      {Array.from({ length: 8 }).map((_, i) => {
        const t = f - 10 - i * 5; if (t < 0) return null;
        return <Abs key={i} x={140 + rnd(i) * 800} y={1080 - t * 4}><div style={{ opacity: Math.max(0, 1 - t / 50), padding: "8px 18px", borderRadius: 20, background: "rgba(62,240,255,0.15)", border: `2px solid ${C.cyan}66`, color: "#fff", fontFamily: F.body, fontWeight: 800, fontSize: 26 }}>{["♥", "★", "!", "🔥".length ? "▲" : "", "♥", "★", "!", "▲"][i]}</div></Abs>;
      })}
    </AbsoluteFill>
  );
};
