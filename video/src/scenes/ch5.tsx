import React from "react";
import { AbsoluteFill } from "remotion";
import { Abs, Counter, Label, Neon, Pop, Card, Draw, Stamp, lerp, sp, useShot, rnd } from "../components/anim";
import { CalTile, Chip, Donut, LineChart } from "../components/Icons";
import { C, F, glow, textGlow } from "../theme";

export const Crash: React.FC = () => {
  const { f, cue } = useShot();
  const br = cue("ломается", 18);
  const pts = [1, 1.6, 1.4, 2.3, 2.9, 2.7, 3.6, 4.1, 1.0, 0.3];
  const shake = f >= br && f < br + 14 ? Math.sin(f * 7) * (14 - (f - br)) : 0;
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${-shake * 0.6}px)` }}>
      <Abs x={540} y={880}><LineChart pts={pts} at={0} dur={br + 4} w={900} h={460} color={f > br - 2 ? C.red : C.green} /></Abs>
      {f >= br && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const a = (i / 9) * Math.PI * 2 + 0.3, l = 300 + rnd(i) * 400;
            const p = lerp(f, br, br + 6);
            return <path key={i} d={`M540 860 L${540 + Math.cos(a) * l * 0.4 * p + 30 * rnd(i + 1)} ${860 + Math.sin(a) * l * 0.4 * p} L${540 + Math.cos(a + 0.1) * l * p} ${860 + Math.sin(a + 0.1) * l * p}`}
              stroke="#fff" strokeOpacity={0.7} strokeWidth={2.5} fill="none" style={{ filter: glow(C.red, 0.6) }} />;
          })}
        </svg>
      )}
      {f >= br && Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 500 + rnd(i + f) * 800, height: 20 + rnd(i * 3 + f) * 50, background: `rgba(255,59,92,${0.12 * (1 - lerp(f, br, br + 20))})`,
          transform: `translateX(${(rnd(i + f * 2) - 0.5) * 80}px)` }} />
      ))}
      <Abs x={540} y={1230}><Pop at={br}><Neon size={90} color={C.red}>ВСЁ ЛОМАЕТСЯ</Neon></Pop></Abs>
    </AbsoluteFill>
  );
};

export const Diagnosis: React.FC = () => {
  const { f, cue } = useShot();
  const l = cue("острая", 26);
  const ecg = (x: number) => {
    const k = ((x + f * 9) % 360);
    return k > 160 && k < 175 ? -120 : k > 175 && k < 190 ? 90 : k > 190 && k < 200 ? -30 : 0;
  };
  const d = "M0 0 " + Array.from({ length: 108 }).map((_, i) => `L${i * 10} ${ecg(i * 10)}`).join(" ");
  return (
    <AbsoluteFill>
      {Array.from({ length: 16 }).map((_, i) => (
        <Abs key={i} x={(rnd(i) * 1200 + f * (1 + rnd(i + 2) * 2)) % 1200 - 60} y={300 + rnd(i + 5) * 1000}>
          <div style={{ width: 70 + rnd(i) * 70, height: 70 + rnd(i) * 70, borderRadius: "50%", border: `5px solid ${C.red}`, background: "radial-gradient(circle, rgba(255,59,92,0.05) 30%, rgba(255,59,92,0.3))",
            opacity: 0.35, transform: `rotateX(${50 + i * 7}deg)` }} />
        </Abs>
      ))}
      <Abs x={540} y={480}><Pop at={0}><Neon size={160} color={C.red}>2019</Neon></Pop></Abs>
      <svg width={1080} height={300} style={{ position: "absolute", left: 0, top: 640 }}>
        <path d={d} transform="translate(0,150)" fill="none" stroke={C.red} strokeWidth={5} style={{ filter: glow(C.red, 1) }} />
      </svg>
      <Abs x={540} y={1080}>
        <Pop at={l}>
          <Card color={C.red} pad={30} style={{ textAlign: "center" }}>
            <Label size={26} color={C.red}>ДИАГНОЗ</Label>
            <div style={{ marginTop: 10 }}><Neon size={58} color={C.red}>ОСТРАЯ ЛЕЙКЕМИЯ</Neon></div>
          </Card>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const Treatment: React.FC = () => {
  const { f, cue } = useShot();
  const p = cue("пересадка", 30);
  const drop = (f % 30) / 30;
  return (
    <AbsoluteFill>
      <svg width={300} height={700} style={{ position: "absolute", left: 390, top: 260 }}>
        <Draw d="M60 20 L240 20 L240 300 C240 340 60 340 60 300 Z" at={0} dur={18} color={C.cyan} width={6} />
        <rect x={66} y={120 + lerp(f, 0, 120) * 60} width={168} height={200 - lerp(f, 0, 120) * 60} rx={12} fill={C.cyan} opacity={0.2} />
        <Draw d="M150 330 L150 380 M150 380 C150 500 150 560 150 700" at={10} dur={18} color={C.cyan} width={4} />
        <circle cx={150} cy={390 + drop * 280} r={10} fill={C.cyan} opacity={1 - drop} style={{ filter: glow(C.cyan, 1) }} />
      </svg>
      <Abs x={540} y={1050}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
          <Pop at={2}><Chip color={C.cyan} size={32}>01 · ХИМИОТЕРАПИЯ</Chip></Pop>
          <div style={{ width: 4, height: 50 * lerp(f, p - 8, p), background: C.cyan, boxShadow: `0 0 12px ${C.cyan}` }} />
          <Pop at={p}><Chip color={C.green} size={32}>02 · ПЕРЕСАДКА КОСТНОГО МОЗГА</Chip></Pop>
        </div>
      </Abs>
      <Abs x={540} y={1320}><div style={{ opacity: lerp(f, p + 10, p + 20) }}><Label size={22} color={C.dim}>О БОЛЕЗНИ ОБЪЯВИЛ ПУБЛИЧНО В МАРТЕ 2020</Label></div></Abs>
    </AbsoluteFill>
  );
};

export const WarPost: React.FC = () => {
  const { f, cue } = useShot();
  const pub = cue("публично", 50);
  const bez = cue("безумной", 80);
  return (
    <AbsoluteFill>
      <Abs x={290} y={520}><Pop at={0}><div style={{ transform: "rotate(-5deg)" }}><CalTile month="АПРЕЛЬ 2022" day={19} w={340} /></div></Pop></Abs>
      <Abs x={700} y={880}>
        <Pop at={pub - 4} y={60}>
          <Card color={C.magenta} w={600} pad={30}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: 32, background: `linear-gradient(135deg, ${C.magenta}, ${C.gold})` }} />
              <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 30, color: "#fff" }}>Публичный пост</div>
            </div>
            {[1, 0.85, 0.95, 0.7].map((w, i) => (
              <div key={i} style={{ marginTop: 22, height: 22, width: `${w * 100 * lerp(f, pub + i * 3, pub + i * 3 + 10)}%`, borderRadius: 11, background: "rgba(255,255,255,0.25)" }} />
            ))}
            <div style={{ marginTop: 26, opacity: lerp(f, bez - 4, bez + 4), fontFamily: F.head, fontWeight: 900, fontSize: 40, color: C.red, textShadow: textGlow(C.red, 0.5) }}>ПРОТИВ ВОЙНЫ</div>
          </Card>
        </Pop>
      </Abs>
      {/* notifications burst */}
      {Array.from({ length: 6 }).map((_, i) => {
        const at = bez + i * 3;
        return (
          <Abs key={i} x={540} y={1290}>
            <div style={{ opacity: lerp(f, at, at + 4) * (1 - lerp(f, at + 14, at + 22)), transform: `translate(${(rnd(i) - 0.5) * 760}px, ${-lerp(f, at, at + 22) * (40 + rnd(i + 2) * 80)}px)` }}>
              <Chip color={i % 2 ? C.red : C.cyan} size={24}>{["СМИ", "РЕПОСТЫ", "РЕАКЦИЯ", "СМИ", "КОММЕНТАРИИ", "РЕПОСТЫ"][i]}</Chip>
            </div>
          </Abs>
        );
      })}
    </AbsoluteFill>
  );
};

export const NineDays: React.FC = () => {
  const { f, dur } = useShot();
  const day = Math.round(lerp(f, 2, Math.min(dur - 4, 40), 19, 28));
  return (
    <AbsoluteFill>
      <Abs x={540} y={480}><Label size={30} color={C.dim}>АПРЕЛЬ 2022</Label></Abs>
      <Abs x={540} y={720}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const d = 19 + i, on = d <= day;
            return (
              <div key={d} style={{ width: 82, height: 110, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.head, fontWeight: 800, fontSize: 34,
                color: on ? "#fff" : "rgba(255,255,255,0.3)", border: `3px solid ${on ? (d === 28 ? C.red : C.cyan) : "rgba(120,150,255,0.25)"}`, background: on ? (d === 28 ? "rgba(255,59,92,0.25)" : "rgba(62,240,255,0.12)") : "transparent",
                boxShadow: on ? `0 0 20px ${d === 28 ? C.red : C.cyan}66` : "none" }}>{d}</div>
            );
          })}
        </div>
      </Abs>
      <Abs x={540} y={1000}><Neon size={170} color={C.red}>{day - 19} {day - 19 === 1 ? "ДЕНЬ" : day - 19 < 5 && day - 19 > 1 ? "ДНЯ" : "ДНЕЙ"}</Neon></Abs>
    </AbsoluteFill>
  );
};

export const StakeSale: React.FC = () => {
  const { f, cue } = useShot();
  const u = cue("уходят", 40);
  const pot = cue("потанина", 90);
  const pull = sp(f, u, 14, 80);
  return (
    <AbsoluteFill>
      <Abs x={540 - pull * 120} y={640}><Donut share={0.35} at={0} pull={pull * 1.2} size={560} label="35%" /></Abs>
      <Abs x={540} y={330}><Pop at={0}><Label size={28} color={C.dim}>ДОЛЯ В TCS GROUP</Label></Pop></Abs>
      <Abs x={540} y={1110}>
        <Pop at={cue("интерросу", 50) - 4}>
          <Card color={C.gold} pad={28} style={{ textAlign: "center" }}>
            <Neon size={64} color={C.gold}>«ИНТЕРРОС»</Neon>
            <div style={{ fontFamily: F.mono, fontSize: 28, color: "#fff", marginTop: 12, opacity: lerp(f, pot - 8, pot) }}>ВЛАДИМИР ПОТАНИН</div>
          </Card>
        </Pop>
      </Abs>
      <Abs x={540} y={1290}><Stamp at={pot + 4} text="28.04.2022" color={C.red} size={40} rot={-4} /></Abs>
    </AbsoluteFill>
  );
};

export const Redacted: React.FC = () => {
  const { f, cue } = useShot();
  const r = cue("раскрыли", 14);
  return (
    <AbsoluteFill>
      <Abs x={540} y={790}>
        <Pop at={0} y={80}>
          <div style={{ width: 680, padding: 46, borderRadius: 16, background: "linear-gradient(180deg,#e9ecf7,#cfd5ea)", boxShadow: `0 0 60px ${C.blue}66, 0 40px 80px rgba(0,0,0,0.6)`, transform: "rotate(-2deg)" }}>
            <div style={{ fontFamily: F.head, fontWeight: 900, fontSize: 34, color: "#0b0f2a", textAlign: "center" }}>ДОГОВОР КУПЛИ-ПРОДАЖИ</div>
            <div style={{ height: 3, background: "#0b0f2a", margin: "20px 0 30px" }} />
            {[["ПРОДАВЕЦ", "О. Тиньков"], ["ПОКУПАТЕЛЬ", "«Интеррос»"], ["ПРЕДМЕТ", "35% TCS Group"]].map(([a, b], i) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", fontFamily: F.mono, fontSize: 28, color: "#1b2250", marginBottom: 20, opacity: lerp(f, 4 + i * 4, 10 + i * 4) }}>
                <span>{a}</span><b>{b}</b>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: F.mono, fontSize: 32, color: "#1b2250", marginTop: 10 }}>
              <span>ЦЕНА</span>
              <div style={{ width: 300 * lerp(f, 8, 22), height: 44, background: "#05060f" }} />
            </div>
            {[0.9, 0.7, 0.8].map((w, i) => <div key={i} style={{ height: 14, width: `${w * 100}%`, background: "#9aa3c7", borderRadius: 7, marginTop: 22 }} />)}
          </div>
        </Pop>
      </Abs>
      <Abs x={560} y={900}><Stamp at={r} text="НЕ РАСКРЫТА" color={C.red} size={56} /></Abs>
    </AbsoluteFill>
  );
};

export const ThreePercent: React.FC = () => {
  const { f, cue } = useShot();
  const tr = cue("трёх", 50);
  const nel = cue("нельзя", 120);
  const lock = sp(f, nel - 4, 10, 200);
  return (
    <AbsoluteFill>
      <Abs x={540} y={330}><Pop at={0}><Label size={26} color={C.dim}>ВЕРСИЯ ТИНЬКОВА (NYT, 2022)</Label></Pop></Abs>
      <Abs x={540} y={820}>
        <div style={{ display: "flex", gap: 120, alignItems: "flex-end", height: 600 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Neon size={52} color={C.cyan}>100%</Neon>
            <div style={{ width: 200, height: 460 * sp(f, 4, 16, 90), background: `linear-gradient(180deg, ${C.cyan}, ${C.cyan}22)`, borderRadius: 18, boxShadow: `0 0 40px ${C.cyan}77` }} />
            <Label size={22} color={C.cyan}>СТОИМОСТЬ</Label>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Counter from={100} to={3} at={tr - 10} dur={24} size={52} color={C.red} fmt={(n) => `≈${Math.round(n)}%`} />
            <div style={{ width: 200, height: interpolateH(f, tr), background: `linear-gradient(180deg, ${C.red}, ${C.red}33)`, borderRadius: 18, boxShadow: `0 0 40px ${C.red}88` }} />
            <Label size={22} color={C.red}>ЦЕНА СДЕЛКИ</Label>
          </div>
        </div>
      </Abs>
      <Abs x={540} y={1250}>
        <div style={{ opacity: Math.min(1, lock * 1.4), transform: `scale(${0.6 + 0.4 * lock})`, display: "flex", alignItems: "center", gap: 22 }}>
          <svg width={80} height={96}><path d={`M18 44 L18 ${30 - (1 - lock) * 14} C18 4 62 4 62 30 L62 44`} stroke={C.red} strokeWidth={8} fill="none" /><rect x={6} y={44} width={68} height={48} rx={10} fill={C.red} style={{ filter: glow(C.red, 1) }} /></svg>
          <Neon size={60} color={C.red}>БЕЗ ТОРГА</Neon>
        </div>
      </Abs>
    </AbsoluteFill>
  );
};
const interpolateH = (f: number, tr: number) => {
  const a = Math.min(1, Math.max(0, (f - 4) / 14));
  const b = Math.min(1, Math.max(0, (f - (tr - 10)) / 24));
  const e = 1 - Math.pow(1 - b, 3);
  return 460 * a * (1 - e * 0.97);
};
