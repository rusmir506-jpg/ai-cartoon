import React from "react";
import { AbsoluteFill } from "remotion";
import { Abs, Counter, Label, Neon, Pop, Card, Draw, Stamp, lerp, sp, useShot, rnd } from "../components/anim";
import { Globe, PLACES } from "../components/Globe";
import { Chip } from "../components/Icons";
import { C, F, glow, textGlow } from "../theme";

const Tv: React.FC<{ at: number; c?: string }> = ({ at, c = C.cyan }) => (
  <svg width={200} height={180} style={{ overflow: "visible" }}>
    <Draw d="M10 30 L190 30 L190 150 L10 150 Z M60 30 L100 0 L140 30 M70 170 L130 170" at={at} dur={14} color={c} width={5} />
    <rect x={28} y={48} width={120} height={84} rx={8} fill={c} opacity={0.15} />
    {[60, 90, 120].map((y, i) => <circle key={i} cx={168} cy={y} r={6} fill={c} />)}
  </svg>
);
const Cassette: React.FC<{ at: number }> = ({ at }) => (
  <svg width={220} height={140} style={{ overflow: "visible" }}>
    <Draw d="M5 5 L215 5 L215 135 L5 135 Z M50 100 L170 100 L190 135 M30 135 L50 100" at={at} dur={14} color={C.magenta} width={5} />
    <circle cx={70} cy={60} r={20} fill="none" stroke={C.magenta} strokeWidth={4} />
    <circle cx={150} cy={60} r={20} fill="none" stroke={C.magenta} strokeWidth={4} />
  </svg>
);

export const Nineties: React.FC = () => {
  const { f } = useShot();
  const digits = f < 22 ? String(1990 + (Math.floor(f / 2) % 10)) : "90-е";
  return (
    <AbsoluteFill>
      <Abs x={540} y={800}>
        <div style={{ transform: `scale(${0.9 + 0.1 * sp(f, 0)})` }}>
          <Neon size={f < 22 ? 220 : 260} color={C.magenta}>{digits}</Neon>
        </div>
      </Abs>
      <Abs x={250} y={1100}><Pop at={14}><div style={{ transform: `rotate(${-8 + Math.sin(f / 9) * 3}deg)` }}><Cassette at={14} /></div></Pop></Abs>
      <Abs x={820} y={1080}><Pop at={20}><div style={{ transform: `rotate(${6 + Math.sin(f / 11) * 3}deg)` }}><Tv at={20} /></div></Pop></Abs>
    </AbsoluteFill>
  );
};

export const MapSingapore: React.FC = () => {
  const { cue, f } = useShot();
  const s = cue("сингапура", 20);
  return (
    <AbsoluteFill>
      <Globe cy={800} size={960} highlight={["702", "643"]} keys={[{ f: 0, lon: 100, lat: 10, scale: 420 }, { f: s, lon: 100, lat: 12, scale: 440 }, { f: s + 50, lon: 65, lat: 35, scale: 400 }]}
        routes={[{ from: PLACES.singapore, to: PLACES.spb, f0: s + 4, f1: s + 50 }]}
        markers={[{ at: PLACES.singapore, label: "СИНГАПУР", f: s - 4, dx: -90, dy: 40 }, { at: PLACES.spb, label: "ПЕТЕРБУРГ", f: s + 46, color: C.cyan, dx: -60, dy: -100 }]} />
      <Abs x={540} y={330}><Pop at={0}><Neon size={76} color={C.cyan}>ЭЛЕКТРОНИКА</Neon></Pop></Abs>
      {[0, 1, 2].map((i) => (
        <Abs key={i} x={240 + i * 300} y={1260 + Math.sin(f / 10 + i) * 8}>
          <Pop at={8 + i * 5}><div style={{ transform: "scale(0.7)" }}>{i === 1 ? <Cassette at={10 + i * 5} /> : <Tv at={8 + i * 5} c={i ? C.violet : C.cyan} />}</div></Pop>
        </Abs>
      ))}
    </AbsoluteFill>
  );
};

export const Technoshock: React.FC = () => {
  const { f } = useShot();
  return (
    <AbsoluteFill>
      <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 380 }}>
        <Draw d="M140 260 L940 260 L940 760 L140 760 Z M200 380 L500 380 L500 640 L200 640 Z M600 380 L880 380 L880 760" at={0} dur={22} color={C.blue} width={5} />
        <rect x={200} y={380} width={300} height={260} fill={C.cyan} opacity={0.08 + 0.04 * Math.sin(f / 5)} />
        <Draw d="M120 260 L180 180 L900 180 L960 260" at={6} dur={18} color={C.violet} width={5} />
      </svg>
      <Abs x={540} y={490}>
        <div style={{ padding: "10px 30px", border: `4px solid ${C.magenta}`, borderRadius: 16, boxShadow: `0 0 30px ${C.magenta}88, inset 0 0 20px ${C.magenta}55` }}>
          <Neon size={84} color={C.magenta} flicker={2}>ТЕХНОШОК</Neon>
        </div>
      </Abs>
      {/* chain of stores */}
      <Abs x={540} y={1250}>
        <div style={{ display: "flex", gap: 22 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Pop key={i} at={14 + i * 3}>
              <svg width={110} height={90}><path d="M10 35 L55 8 L100 35 L100 85 L10 85 Z M40 85 L40 55 L70 55 L70 85" fill="none" stroke={C.cyan} strokeWidth={5} style={{ filter: glow(C.cyan, 0.6) }} /></svg>
            </Pop>
          ))}
        </div>
      </Abs>
      <Abs x={540} y={1360}><div style={{ opacity: lerp(f, 30, 40) }}><Label size={26} color={C.dim}>СЕТЬ МАГАЗИНОВ ЭЛЕКТРОНИКИ</Label></div></Abs>
    </AbsoluteFill>
  );
};

const Dumpling: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={120 * s} height={80 * s} viewBox="0 0 120 80" style={{ overflow: "visible" }}>
    <path d="M10 60 C10 10 110 10 110 60 Z" fill="rgba(255,240,220,0.12)" stroke="#ffe9c9" strokeWidth={4} style={{ filter: glow("#ffd8a0", 0.6) }} />
    {[25, 40, 55, 70, 85, 100].map((x) => <path key={x} d={`M${x} ${60 - Math.sin(((x - 10) / 100) * Math.PI) * 38} l-4 -8`} stroke="#ffe9c9" strokeWidth={3} />)}
  </svg>
);

export const Daria: React.FC = () => {
  const { f, cue } = useShot();
  const d = cue("дарья", 16);
  return (
    <AbsoluteFill>
      {Array.from({ length: 22 }).map((_, i) => (
        <Abs key={i} x={rnd(i) * 1080} y={((rnd(i + 5) * 1400 + f * (1.5 + rnd(i) * 2)) % 1400) + 250}>
          <div style={{ color: "#bfe8ff", fontSize: 26 + rnd(i + 2) * 30, opacity: 0.5, transform: `rotate(${f * 2 + i * 20}deg)` }}>✻</div>
        </Abs>
      ))}
      <Abs x={540} y={760}>
        <Pop at={0} y={80}>
          <div style={{ width: 560, height: 560, borderRadius: 40, border: `4px solid ${C.cyan}`, background: "linear-gradient(160deg, rgba(62,240,255,0.18), rgba(77,124,255,0.08))",
            boxShadow: `0 0 50px ${C.cyan}66`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
            <Label color={C.cyan} size={26}>ПЕЛЬМЕНИ</Label>
            <Pop at={d}><Neon size={120} color={C.gold}>«ДАРЬЯ»</Neon></Pop>
            <div style={{ display: "flex", gap: 10 }}>{[0, 1, 2].map((i) => <Pop key={i} at={6 + i * 4}><Dumpling /></Pop>)}</div>
          </div>
        </Pop>
      </Abs>
      <Abs x={540} y={1200}><Pop at={d + 6}><Chip color={C.cyan}>1998 · ЗАМОРОЖЕННЫЕ ПРОДУКТЫ</Chip></Pop></Abs>
    </AbsoluteFill>
  );
};

export const Brewery: React.FC = () => {
  const { f, cue } = useShot();
  const t = cue("тинькофф", 18);
  const fill = lerp(f, 4, 40);
  return (
    <AbsoluteFill>
      <Abs x={540} y={410}><div style={{ padding: "8px 30px", border: `4px solid ${C.gold}`, borderRadius: 14, boxShadow: `0 0 30px ${C.gold}88` }}><Neon size={80} color={C.gold} flicker={t}>ТИНЬКОФФ</Neon></div></Abs>
      <svg width={1080} height={760} style={{ position: "absolute", left: 0, top: 520 }}>
        <defs>
          <clipPath id="glass"><path d="M380 60 L700 60 L670 640 L410 640 Z" /></clipPath>
          <linearGradient id="beer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd84d" /><stop offset="1" stopColor="#c76a00" /></linearGradient>
        </defs>
        <g clipPath="url(#glass)">
          <rect x={360} y={640 - 560 * fill} width={360} height={600} fill="url(#beer)" opacity={0.85} />
          <rect x={360} y={600 - 560 * fill} width={360} height={60 * Math.min(1, fill * 3)} fill="#fff7e0" opacity={0.95} />
          {Array.from({ length: 18 }).map((_, i) => (
            <circle key={i} cx={420 + rnd(i) * 240} cy={640 - ((f * (3 + rnd(i) * 3) + rnd(i + 9) * 500) % (560 * fill + 1))} r={4 + rnd(i + 1) * 6} fill="#fff" opacity={0.6} />
          ))}
        </g>
        <Draw d="M380 60 L700 60 L670 640 L410 640 Z M700 160 C820 160 820 460 685 460" at={0} dur={20} color={C.cyan} width={6} />
      </svg>
      <Abs x={540} y={1240}><Pop at={t + 4}><Chip color={C.gold}>1998 · ПИВОВАРНЯ-РЕСТОРАН</Chip></Pop></Abs>
    </AbsoluteFill>
  );
};

export const BeerDeal: React.FC = () => {
  const { f, cue } = useShot();
  const inter = cue("интербрю", 70);
  const m = cue("двухсот", 110);
  const arrow = lerp(f, inter - 6, inter + 8);
  return (
    <AbsoluteFill>
      <Abs x={540} y={340}><Pop at={0}><Neon size={120} color={C.gold}>2005</Neon></Pop></Abs>
      <Abs x={540} y={560}><Pop at={cue("пивной", 10)}><Card color={C.gold} pad={26}><div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 42, color: "#fff" }}>ПИВНОЙ БИЗНЕС</div></Card></Pop></Abs>
      <svg width={1080} height={200} style={{ position: "absolute", left: 0, top: 640 }}>
        <path d={`M540 10 L540 ${10 + 150 * arrow}`} stroke={C.gold} strokeWidth={8} style={{ filter: glow(C.gold, 1) }} />
        {arrow > 0.95 && <path d="M510 140 L540 175 L570 140" stroke={C.gold} strokeWidth={8} fill="none" style={{ filter: glow(C.gold, 1) }} />}
      </svg>
      <Abs x={540} y={900}><Pop at={inter}><Card color={C.cyan} pad={26}><div style={{ fontFamily: F.head, fontWeight: 800, fontSize: 42, color: "#fff" }}>SUN INTERBREW</div></Card></Pop></Abs>
      <Abs x={540} y={1130}>
        <Pop at={m - 8}>
          <Counter from={0} to={200} at={m - 6} dur={26} size={120} color={C.green} fmt={(n) => `≈$${Math.round(n)} МЛН`} />
        </Pop>
      </Abs>
      <Abs x={540} y={1250}><div style={{ opacity: lerp(f, m + 20, m + 30) }}><Label size={24} color={C.dim}>€167 МЛН · ОЦЕНКИ СУММЫ РАЗНЯТСЯ</Label></div></Abs>
    </AbsoluteFill>
  );
};

export const Formula: React.FC = () => {
  const { f, cue } = useShot();
  const steps = [
    { t: "ИДЕЯ", at: cue("формула", 8) },
    { t: "БРЕНД", at: cue("бренд", 25) },
    { t: "ПИК", at: cue("продать", 45) },
    { t: "ПРОДАЖА", at: cue("пике", 55) },
  ];
  return (
    <AbsoluteFill>
      <Abs x={540} y={330}><Pop at={0}><Label size={30} color={C.dim}>ФОРМУЛА ТИНЬКОВА</Label></Pop></Abs>
      {steps.map((s, i) => {
        const y = 470 + i * 200;
        const on = sp(f, s.at, 12, 160);
        return (
          <React.Fragment key={s.t}>
            {i > 0 && <div style={{ position: "absolute", left: 538, top: y - 130, width: 4, height: 60 * lerp(f, s.at - 6, s.at), background: C.cyan, boxShadow: `0 0 12px ${C.cyan}` }} />}
            <Abs x={540} y={y}>
              <div style={{ width: 520, padding: "22px 0", textAlign: "center", borderRadius: 24, border: `3px solid ${on > 0.1 ? C.cyan : "rgba(120,150,255,0.3)"}`,
                background: on > 0.1 ? "rgba(62,240,255,0.12)" : "rgba(10,15,40,0.5)", boxShadow: on > 0.1 ? `0 0 40px ${C.cyan}66` : "none", transform: `scale(${0.92 + 0.08 * on})` }}>
                <span style={{ fontFamily: F.mono, color: C.dim, fontSize: 28, marginRight: 20 }}>0{i + 1}</span>
                <span style={{ fontFamily: F.head, fontWeight: 900, fontSize: 52, color: "#fff", textShadow: on > 0.1 ? textGlow(C.cyan, 0.5) : "none" }}>{s.t}</span>
              </div>
            </Abs>
          </React.Fragment>
        );
      })}
      <Abs x={540} y={1265}>
        <div style={{ display: "flex", gap: 16 }}>
          {["ТЕХНОШОК", "ДАРЬЯ", "ПИВО"].map((t, i) => (
            <Pop key={t} at={8 + i * 5}><div style={{ position: "relative" }}><Chip color={C.violet} size={24}>{t}</Chip>
              <div style={{ position: "absolute", left: 10, top: -26 }}><Stamp at={cue("пике", 60) + i * 3} text="ПРОДАН" size={20} rot={-10} color={C.green} style={{ border: `3px solid ${C.green}`, padding: "2px 10px" }} /></div></div></Pop>
          ))}
        </div>
      </Abs>
    </AbsoluteFill>
  );
};
