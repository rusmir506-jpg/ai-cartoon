import React from "react";
import { AbsoluteFill } from "remotion";
import { Abs, Label, Neon, Pop, Card, Stamp, lerp, sp, useShot, rnd } from "../components/anim";
import { Globe, PLACES } from "../components/Globe";
import { Chip } from "../components/Icons";
import { C, F, glow, textGlow } from "../theme";

export const Passport: React.FC = () => {
  const { f, cue } = useShot();
  const g = cue("гражданства", 50);
  return (
    <AbsoluteFill>
      <Abs x={540} y={850}>
        <Pop at={4} y={80}>
          <div style={{ width: 480, height: 660, borderRadius: 26, background: "linear-gradient(160deg,#5a1424,#2a0812)", border: `3px solid ${C.gold}88`, boxShadow: `0 0 50px ${C.red}55, 0 40px 80px rgba(0,0,0,0.6)`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40, transform: `perspective(1200px) rotateY(${Math.sin(f / 30) * 10}deg)` }}>
            <svg width={160} height={160}><circle cx={80} cy={80} r={70} fill="none" stroke={C.gold} strokeWidth={4} /><circle cx={80} cy={80} r={46} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray="6 8" /></svg>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 52, color: C.gold, letterSpacing: "0.1em", textShadow: textGlow(C.gold, 0.3) }}>ПАСПОРТ</div>
          </div>
        </Pop>
      </Abs>
      <Abs x={540} y={900}><Stamp at={g} text="ОТКАЗ ОТ ГРАЖДАНСТВА" color={C.cyan} size={40} rot={-14} /></Abs>
      <Abs x={540} y={1280}><Pop at={cue("октябре", 6)}><Chip color={C.cyan}>ОКТЯБРЬ 2022</Chip></Pop></Abs>
    </AbsoluteFill>
  );
};

export const Rebrand: React.FC = () => {
  const { f, cue } = useShot();
  const fam = cue("фамилию", 50);
  const tb = cue("т-банк", 90);
  const letters = "ТИНЬКОФФ".split("");
  return (
    <AbsoluteFill>
      <Abs x={540} y={380}><Pop at={0}><Neon size={110} color={C.gold}>2024</Neon></Pop></Abs>
      <Abs x={540} y={800}>
        <div style={{ display: "flex" }}>
          {letters.map((l, i) => {
            const k = i === 0 ? 0 : lerp(f, fam + i * 2, fam + i * 2 + 14);
            const jitter = k > 0 && k < 1 ? (rnd(i + f) - 0.5) * 30 : 0;
            const center = i === 0 ? lerp(f, fam + 16, fam + 34) * 330 : 0;
            return (
              <div key={i} style={{ opacity: 1 - k, transform: `translate(${jitter + center}px, ${k * (200 + rnd(i) * 300)}px) rotate(${k * (rnd(i + 1) - 0.5) * 120}deg)`, filter: k > 0 ? `blur(${k * 8}px)` : undefined }}>
                <Neon size={104} color={i === 0 ? C.gold : C.cyan}>{l}</Neon>
              </div>
            );
          })}
        </div>
      </Abs>
      <Abs x={540} y={1100}>
        <Pop at={tb - 2} from={1.6} damping={10}>
          <div style={{ padding: "16px 50px", borderRadius: 30, background: C.gold, whiteSpace: "nowrap", boxShadow: `0 0 60px ${C.gold}aa` }}>
            <span style={{ fontFamily: F.head, fontWeight: 900, fontSize: 110, color: "#111" }}>Т-БАНК</span>
          </div>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const MapMexico: React.FC = () => {
  const { cue } = useShot();
  const m = cue("мексике", 40);
  return (
    <AbsoluteFill>
      <Globe cy={820} size={980} highlight={["484"]} hl={C.green} keys={[{ f: 0, lon: 20, lat: 45, scale: 380 }, { f: m + 10, lon: -80, lat: 25, scale: 420 }, { f: m + 120, lon: -95, lat: 22, scale: 520 }]}
        routes={[{ from: PLACES.moscow, to: PLACES.mexico, f0: 4, f1: m + 8, color: C.green }]}
        markers={[{ at: PLACES.mexico, label: "МЕКСИКА", f: m + 4, color: C.green, dx: 30, dy: -80 }]} />
      <Abs x={540} y={330}><Pop at={cue("бывшие", 2)}><Label size={28} color={C.dim}>БЫВШИЕ ТОП-МЕНЕДЖЕРЫ ТИНЬКОФФ</Label></Pop></Abs>
    </AbsoluteFill>
  );
};

export const Plata: React.FC = () => {
  const { f, cue } = useShot();
  const k = cue("консультирует", 30);
  return (
    <AbsoluteFill>
      <Abs x={540} y={560}>
        <Pop at={0} from={1.5} damping={10}>
          <div style={{ padding: "26px 70px", borderRadius: 36, border: `4px solid ${C.green}`, background: "rgba(61,255,160,0.08)", boxShadow: `0 0 60px ${C.green}66` }}>
            <Neon size={140} color={C.green}>PLATA</Neon>
          </div>
        </Pop>
      </Abs>
      <Abs x={540} y={930}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <Pop at={6}><Chip color={C.green} size={28}>ЦИФРОВОЙ БАНК · МЕКСИКА</Chip></Pop>
          <Pop at={12}><Chip color={C.cyan} size={28}>БАНКОВСКАЯ ЛИЦЕНЗИЯ · 2026</Chip></Pop>
          <Pop at={18}><Chip color={C.gold} size={28}>ОЦЕНКА ≈$5 МЛРД · 2026</Chip></Pop>
        </div>
      </Abs>
      <Abs x={540} y={1250}><Pop at={k - 4}><Card color={C.violet} pad={20}><span style={{ fontFamily: F.head, fontWeight: 800, fontSize: 34, color: "#fff" }}>ТИНЬКОВ — КОНСУЛЬТАНТ ПРОЕКТА</span></Card></Pop></Abs>
    </AbsoluteFill>
  );
};

export const Finale: React.FC = () => {
  const { f, cue, dur } = useShot();
  const lost = cue("потерял", 6);
  const no = cue("но", 60);
  const end = cue("создала", 100);
  const years = ["1967", "1992", "1998", "2005", "2006", "2013", "2019", "2022", "2024"];
  const fadeTl = lerp(f, end + 6, end + 18);
  return (
    <AbsoluteFill>
      {/* timeline of the whole story */}
      <div style={{ position: "absolute", left: 0, top: 420, width: 1080, opacity: 1 - fadeTl }}>
        <svg width={1080} height={200}>
          <line x1={60} x2={60 + 960 * lerp(f, 0, 30)} y1={100} y2={100} stroke={C.cyan} strokeWidth={4} style={{ filter: glow(C.cyan, 0.6) }} />
          {years.map((y, i) => {
            const x = 60 + (i / (years.length - 1)) * 960;
            const on = lerp(f, i * 3, i * 3 + 6);
            const red = i >= 6;
            return (
              <g key={y} opacity={on}>
                <circle cx={x} cy={100} r={12} fill={red ? C.red : C.cyan} style={{ filter: glow(red ? C.red : C.cyan, 0.8) }} />
                <text x={x} y={i % 2 ? 160 : 60} textAnchor="middle" fill="#fff" fontFamily={F.mono} fontWeight={700} fontSize={26}>{y}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <Abs x={540} y={800}>
        <div style={{ opacity: 1 - lerp(f, no - 2, no + 8) * 0.75, transform: `scale(${1 - lerp(f, no, no + 10) * 0.15})` }}>
          <Pop at={lost}>
            <div style={{ display: "flex" }}>
              {"ТИНЬКОФФ".split("").map((l, i) => (
                <div key={i} style={{ opacity: 1 - lerp(f, lost + 14 + i * 2, lost + 24 + i * 2) * 0.8, transform: `translateY(${lerp(f, lost + 14 + i * 2, lost + 30 + i * 2) * 40}px)` }}>
                  <Neon size={100} color={C.dim}>{l}</Neon>
                </div>
              ))}
            </div>
          </Pop>
        </div>
      </Abs>
      <Abs x={540} y={1060}>
        <Pop at={no} from={1.8} damping={10}>
          <div style={{ textAlign: "center" }}>
            <Label size={30} color={C.dim}>НО НЕ</Label>
            <Neon size={110} color={C.gold}>ФОРМУЛУ</Neon>
          </div>
        </Pop>
      </Abs>
      {/* end card */}
      {f > end + 6 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(3,4,12,${lerp(f, end + 6, end + 22)})` }}>
          <Abs x={540} y={700}><Pop at={end + 14}><Neon size={120} color={C.cyan}>ОЛЕГ</Neon></Pop></Abs>
          <Abs x={540} y={850}><Pop at={end + 18}><Neon size={110} color={C.gold}>ТИНЬКОВ</Neon></Pop></Abs>
          <Abs x={540} y={980}><Pop at={end + 26}><Label size={26} color="#fff">ИСТОРИЯ ОДНОЙ ИМПЕРИИ</Label></Pop></Abs>
          <Abs x={540} y={1220}>
            <div style={{ opacity: lerp(f, end + 30, end + 44), textAlign: "center", fontFamily: F.mono, fontSize: 20, color: C.dim, lineHeight: 1.6, width: 900 }}>
              ИСТОЧНИКИ: THE NEW YORK TIMES, THE MOSCOW TIMES, FORBES,<br />BLOOMBERG, LSE / TCS GROUP. ОЦЕНКИ СТОИМОСТИ — ПО ДАННЫМ СМИ.
            </div>
          </Abs>
        </div>
      )}
    </AbsoluteFill>
  );
};
