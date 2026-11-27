import React from "react";
import { AbsoluteFill } from "remotion";
import { Abs, Counter, Label, Neon, Pop, Card, Draw, Stamp, lerp, sp, useShot, rnd } from "../components/anim";
import { Globe, PLACES } from "../components/Globe";
import { Bank, Chip, CreditCard, Phone } from "../components/Icons";
import { C, F, glow, textGlow } from "../theme";

export const Year2006: React.FC = () => {
  const { f } = useShot();
  return (
    <AbsoluteFill>
      <Abs x={540} y={800}><Counter from={1998} to={2006} at={4} dur={26} size={230} color={C.cyan} /></Abs>
      <Abs x={540} y={1030}><div style={{ width: lerp(f, 20, 40) * 700, height: 3, background: `linear-gradient(90deg,transparent,${C.cyan},transparent)` }} /></Abs>
      <Abs x={540} y={1110}><Pop at={26}><Label size={30} color={C.gold}>НОВАЯ СТАВКА — БАНК</Label></Pop></Abs>
    </AbsoluteFill>
  );
};

export const Khimmash: React.FC = () => {
  const { f, cue } = useShot();
  const k = cue("химмашбанк", 30);
  return (
    <AbsoluteFill>
      <Abs x={540} y={420}><Pop at={cue("маленький", 12)}><Chip color={C.dim}>МАЛЕНЬКИЙ БАНК</Chip></Pop></Abs>
      <Abs x={540} y={760}><div style={{ transform: `scale(${0.8 + 0.2 * sp(f, 0)})` }}><Bank w={420} h={340} color={C.violet} /></div></Abs>
      <Abs x={540} y={1040}><Pop at={k - 6}><Neon size={76} color={C.violet}>ХИММАШБАНК</Neon></Pop></Abs>
      <Abs x={540} y={760}><Stamp at={k + 8} text="КУПЛЕН" color={C.gold} /></Abs>
      <Abs x={540} y={1180}><div style={{ opacity: lerp(f, k + 18, k + 28) }}><Label size={26} color={C.cyan}>→ «ТИНЬКОФФ КРЕДИТНЫЕ СИСТЕМЫ»</Label></div></Abs>
    </AbsoluteFill>
  );
};

export const NoBranches: React.FC = () => {
  const { f, cue } = useShot();
  const bez = cue("без", 40);
  const otd = cue("отделений", 50);
  return (
    <AbsoluteFill>
      <Abs x={540} y={370}><Pop at={cue("безумной", 12)}><Label size={32} color={C.magenta}>ИДЕЯ «БЕЗУМНАЯ»</Label></Pop></Abs>
      <Abs x={540} y={760}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 150px)", gap: 24 }}>
          {Array.from({ length: 15 }).map((_, i) => {
            const kill = bez + rnd(i) * 12;
            const x = lerp(f, kill, kill + 6);
            return (
              <div key={i} style={{ position: "relative", opacity: lerp(f, i, i + 8) * (1 - 0.7 * x) }}>
                <svg width={150} height={120}><path d="M15 45 L75 10 L135 45 L135 110 L15 110 Z M60 110 L60 75 L90 75 L90 110" fill="none" stroke={C.blue} strokeWidth={5} style={{ filter: glow(C.blue, 0.4) }} /></svg>
                {x > 0 && <svg width={150} height={120} style={{ position: "absolute", left: 0, top: 0 }}><path d={`M20 15 L${20 + 110 * x} ${15 + 95 * x} M130 15 L${130 - 110 * x} ${15 + 95 * x}`} stroke={C.red} strokeWidth={8} style={{ filter: glow(C.red, 0.8) }} /></svg>}
              </div>
            );
          })}
        </div>
      </Abs>
      <Abs x={540} y={1180}>
        <Pop at={otd - 2} damping={9}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}><Neon size={150} color={C.cyan}>0</Neon><Neon size={54} color={C.cyan}>ОТДЕЛЕНИЙ</Neon></div>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const CardsMail: React.FC = () => {
  const { f, cue } = useShot();
  const p = cue("почте", 12);
  const fly = sp(f, p, 16, 90);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 0.85 }}>
        <Globe cy={900} size={1000} highlight={["643"]} keys={[{ f: 0, lon: 70, lat: 52, scale: 650 }, { f: 120, lon: 78, lat: 52, scale: 700 }]}
          routes={Array.from({ length: 9 }).map((_, i) => ({ from: PLACES.moscow, to: [40 + rnd(i) * 95, 47 + rnd(i + 4) * 18] as [number, number], f0: p + i * 3, f1: p + 22 + i * 3, color: C.cyan }))}
          markers={[{ at: PLACES.moscow, label: "МОСКВА", f: 0, dx: -60, dy: 30 }]} />
      </div>
      <Abs x={540} y={480 - (1 - fly) * 60}>
        <div style={{ transform: `perspective(1200px) rotateY(${(1 - fly) * 60 + Math.sin(f / 20) * 8}deg) rotateX(${8 + Math.sin(f / 25) * 4}deg) scale(${0.6 + 0.4 * sp(f, 0)})` }}>
          <CreditCard w={560} label="КРЕДИТНАЯ КАРТА" />
        </div>
      </Abs>
      <Abs x={540} y={1260}><Pop at={p}><Chip color={C.gold}>✉ КАРТЫ ПО ПОЧТЕ · 2007</Chip></Pop></Abs>
    </AbsoluteFill>
  );
};

export const PhoneApp: React.FC = () => {
  const { f, cue } = useShot();
  const tel = cue("телефону", 20);
  const app = cue("приложении", 60) - 6;
  const ring = f >= tel && f < app;
  const tx = [["ПЕРЕВОД", "−2 500 ₽"], ["КЭШБЭК", "+340 ₽"], ["ОПЛАТА", "−780 ₽"], ["ПОПОЛНЕНИЕ", "+15 000 ₽"]];
  return (
    <AbsoluteFill>
      <Abs x={540} y={800}>
        <Pop at={0} y={100}>
          <div style={{ transform: `rotate(${ring ? Math.sin(f * 2.2) * 3 : 0}deg)` }}>
            <Phone w={460} h={880}>
              {f < app ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
                  <svg width={300} height={300}>
                    {[0, 1, 2].map((i) => { const r = ((f * 2 + i * 33) % 100) / 100; return <circle key={i} cx={150} cy={150} r={60 + r * 90} fill="none" stroke={C.green} strokeWidth={4} opacity={1 - r} />; })}
                    <circle cx={150} cy={150} r={56} fill={C.green} style={{ filter: glow(C.green, 1) }} />
                    <text x={150} y={170} textAnchor="middle" fontSize={56} fill="#05210f">✆</text>
                  </svg>
                  <Label color={C.green} size={28}>ВХОДЯЩИЙ ЗВОНОК</Label>
                </div>
              ) : (
                <div style={{ padding: "90px 26px 0" }}>
                  <Pop at={app}><div style={{ borderRadius: 28, padding: 28, background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`, boxShadow: `0 0 30px ${C.violet}88` }}>
                    <div style={{ fontFamily: F.mono, color: "rgba(255,255,255,0.8)", fontSize: 22 }}>БАЛАНС</div>
                    <Counter from={0} to={128450} at={app + 4} dur={30} size={54} color="#ffffff" font={F.head} fmt={(n) => `${Math.round(n).toLocaleString("ru-RU")} ₽`} style={{ textShadow: "none" }} />
                  </div></Pop>
                  {tx.map(([a, b], i) => (
                    <Pop key={a} at={app + 10 + i * 5} y={40}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "22px 6px", borderBottom: `1px solid ${C.line}`, fontFamily: F.body, fontWeight: 700, fontSize: 28, color: "#fff" }}>
                        <span>{a}</span><span style={{ color: b.startsWith("+") ? C.green : "#fff" }}>{b}</span>
                      </div>
                    </Pop>
                  ))}
                </div>
              )}
            </Phone>
          </div>
        </Pop>
      </Abs>
      <Abs x={540} y={1290}><Pop at={app + 2}><Chip color={C.violet}>ВСЁ — В ПРИЛОЖЕНИИ</Chip></Pop></Abs>
    </AbsoluteFill>
  );
};
