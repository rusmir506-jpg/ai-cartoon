import React from "react";
import { AbsoluteFill } from "remotion";
import { Abs, Counter, Label, Neon, Pop, Stamp, Card, lerp, sp, useShot, rnd } from "../components/anim";
import { Bank, Donut, Phone, Chip } from "../components/Icons";
import { C, F, glow, textGlow } from "../theme";

export const HookBank: React.FC = () => {
  const { f, cue } = useShot();
  const zero = cue("отделения", 60);
  const big = cue("крупнейший", 20);
  return (
    <AbsoluteFill>
      <Abs x={540} y={330}><Pop at={big}><Chip color={C.gold}>КРУПНЕЙШИЙ ОНЛАЙН-БАНК</Chip></Pop></Abs>
      <Abs x={540} y={700}>
        <div style={{ transform: `scale(${1 + 0.04 * Math.sin(f / 12)})` }}><Bank at={0} w={640} h={500} /></div>
      </Abs>
      {/* branches orbiting then removed */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + f / 60;
        const o = lerp(f, 6 + i * 2, 14 + i * 2) * (1 - lerp(f, zero - 4, zero + 4));
        return (
          <Abs key={i} x={540 + Math.cos(a) * 420} y={720 + Math.sin(a) * 300}>
            <div style={{ opacity: o }}><Bank w={90} h={74} color={C.violet} dur={10} at={6 + i * 2} /></div>
          </Abs>
        );
      })}
      <Abs x={540} y={1170}>
        <Pop at={zero} damping={9}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <Neon size={170} color={C.cyan}>0</Neon>
            <Neon size={58} color={C.cyan} font={F.head}>ОТДЕЛЕНИЙ</Neon>
          </div>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const HookPost: React.FC = () => {
  const { f, cue } = useShot();
  const nine = cue("девять", 25);
  const post = cue("поста", 60);
  const likes = lerp(f, post - 10, post + 40, 0.05, 1);
  return (
    <AbsoluteFill>
      <Abs x={360} y={760}>
        <Pop at={0} y={120}>
          <Phone w={430} h={800}>
            <div style={{ padding: "90px 28px 0", fontFamily: F.body, color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 70, height: 70, borderRadius: 40, background: `linear-gradient(135deg, ${C.magenta}, ${C.gold})` }} />
                <div><div style={{ fontWeight: 800, fontSize: 28 }}>ПОСТ</div><div style={{ fontSize: 22, color: C.dim }}>19.04.2022</div></div>
              </div>
              <div style={{ marginTop: 30, height: 300, borderRadius: 24, background: "linear-gradient(135deg,#1a1f55,#2b1450)", border: `1px solid ${C.line}`, padding: 24 }}>
                {[0.9, 0.75, 0.95, 0.6, 0.85].map((w, i) => (
                  <div key={i} style={{ height: 22, width: `${w * 100 * lerp(f, 6 + i * 3, 16 + i * 3)}%`, background: "rgba(255,255,255,0.28)", borderRadius: 11, marginBottom: 22 }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 30, marginTop: 30, fontFamily: F.mono, fontSize: 30, fontWeight: 700 }}>
                <span style={{ color: C.magenta, textShadow: textGlow(C.magenta, 0.4) }}>♥</span>
                <div style={{ flex: 1, height: 16, marginTop: 10, borderRadius: 8, background: "rgba(255,255,255,0.1)" }}>
                  <div style={{ width: `${likes * 100}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, ${C.magenta}, ${C.gold})`, boxShadow: `0 0 14px ${C.magenta}` }} />
                </div>
              </div>
            </div>
          </Phone>
        </Pop>
      </Abs>
      {/* hearts floating */}
      {Array.from({ length: 14 }).map((_, i) => {
        const t = f - post - i * 3;
        if (t < 0) return null;
        return <Abs key={i} x={300 + rnd(i) * 200} y={1050 - t * (6 + rnd(i + 4) * 5)}><div style={{ fontSize: 40, color: C.magenta, opacity: Math.max(0, 1 - t / 40), filter: glow(C.magenta, 0.5) }}>♥</div></Abs>;
      })}
      <Abs x={830} y={560}>
        <Pop at={nine - 6} from={0.3}>
          <Card w={300} pad={26} color={C.red} style={{ textAlign: "center" }}>
            <Label color={C.red} size={24}>ЧЕРЕЗ</Label>
            <Counter from={1} to={9} at={nine - 4} dur={16} size={150} color={C.red} />
            <Label color="#fff" size={26}>ДНЕЙ</Label>
          </Card>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const HookSold: React.FC = () => {
  const { f, cue } = useShot();
  const stamp = cue("долю", 20);
  const dar = cue("даром", 70);
  const pull = sp(f, stamp - 6, 12, 120);
  const glitch = f >= dar && f < dar + 10 ? (Math.floor(f) % 2 ? 14 : -14) : 0;
  return (
    <AbsoluteFill>
      <Abs x={540} y={620}>
        <Donut share={0.35} at={0} pull={pull} size={560} label="35%" />
      </Abs>
      <Abs x={540} y={620}><Stamp at={stamp} text="ПРОДАНО" /></Abs>
      <Abs x={540} y={1090}>
        <Pop at={dar - 3}>
          <div style={{ transform: `translateX(${glitch}px)`, textAlign: "center" }}>
            <Card color={C.gold} pad={26} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <Label color={C.dim} size={26}>ЦЕНА</Label>
              <Neon size={96} color={C.gold}>≈3%*</Neon>
            </Card>
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.dim, marginTop: 14 }}>* оценка самого Тинькова</div>
          </div>
        </Pop>
      </Abs>
    </AbsoluteFill>
  );
};

export const HookTitle: React.FC = () => {
  const { f, cue, dur } = useShot();
  const name = cue("олега", 8);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[260, 340, 420].map((r, i) => (
          <circle key={r} cx={540} cy={760} r={r * (0.6 + 0.4 * sp(f, i * 4, 16))} fill="none" stroke={i === 1 ? C.violet : C.blue} strokeWidth={2}
            strokeDasharray={i === 1 ? "4 18" : "120 40"} transform={`rotate(${f * (i % 2 ? -0.6 : 0.8)} 540 760)`} opacity={0.6} style={{ filter: glow(C.blue, 0.5) }} />
        ))}
      </svg>
      <Abs x={540} y={560}><Pop at={0}><Label color={C.dim} size={30}>ДОКУМЕНТАЛЬНАЯ ИСТОРИЯ</Label></Pop></Abs>
      <Abs x={540} y={690}><Neon size={150} color={C.cyan} flicker={name}>ОЛЕГ</Neon></Abs>
      <Abs x={540} y={850}><Neon size={124} color={C.gold} flicker={name + 6}>ТИНЬКОВ</Neon></Abs>
      <Abs x={540} y={990}>
        <div style={{ width: lerp(f, name + 10, name + 30) * 760, height: 3, background: `linear-gradient(90deg,transparent,${C.cyan},transparent)`, boxShadow: `0 0 18px ${C.cyan}` }} />
      </Abs>
      <Abs x={540} y={1060}><Pop at={Math.min(name + 16, dur - 10)}><Label color="#fff" size={30}>ВЗЛЁТ И ПАДЕНИЕ БАНКОВСКОЙ ИМПЕРИИ</Label></Pop></Abs>
    </AbsoluteFill>
  );
};
