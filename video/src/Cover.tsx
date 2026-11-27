import React from "react";
import { AbsoluteFill } from "remotion";
import { Background, Overlay } from "./components/Background";
import { Abs, Label, Neon, Stamp, Draw } from "./components/anim";
import { Bank, Chip } from "./components/Icons";
import { C, F, glow, textGlow } from "./theme";

/** Обложка 1080×1920. Ключевой текст держим в центральной зоне 3:4 (y≈240–1680) — её показывает сетка профиля TikTok/Reels. */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg0 }}>
    <Background crisis={0.35} hue={1.2} />
    {/* red glow behind bank */}
    <AbsoluteFill style={{ background: "radial-gradient(45% 25% at 50% 52%, rgba(255,59,92,0.35), transparent 70%)" }} />
    <Abs x={540} y={300}><Chip color={C.cyan} size={30} at={-60}>ДОКУМЕНТАЛЬНАЯ ИСТОРИЯ</Chip></Abs>
    <Abs x={540} y={440}><Neon size={150} color={C.cyan}>ОЛЕГ</Neon></Abs>
    <Abs x={540} y={590}><Neon size={132} color={C.gold}>ТИНЬКОВ</Neon></Abs>
    <Abs x={540} y={910}>
      <div style={{ position: "relative" }}>
        <Bank w={560} h={440} color={C.cyan} at={-60} />
        {/* crack */}
        <svg width={560} height={440} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <Draw d="M300 10 L270 120 L320 190 L250 300 L300 360 L260 440" at={-60} dur={10} color={C.red} width={8} />
        </svg>
      </div>
    </Abs>
    <Abs x={600} y={970}><Stamp at={-60} text="ПРОДАНО" color={C.red} size={84} rot={-14} /></Abs>
    <Abs x={540} y={1320}>
      <div style={{ textAlign: "center", fontFamily: F.head, fontWeight: 900, lineHeight: 1.05 }}>
        <div style={{ fontSize: 62, color: "#fff", whiteSpace: "nowrap", textShadow: "0 6px 30px rgba(0,0,0,0.9)" }}>ПОСТРОИЛ ИМПЕРИЮ</div>
        <div style={{ fontSize: 66, color: C.red, textShadow: textGlow(C.red, 0.8), marginTop: 10, whiteSpace: "nowrap" }}>ПОТЕРЯЛ ЗА 9 ДНЕЙ</div>
      </div>
    </Abs>
    <Abs x={540} y={1500}><Label size={28} color={C.dim}>КАК ТИНЬКОВ ЛИШИЛСЯ СВОЕГО БАНКА</Label></Abs>
    <Abs x={540} y={1610}>
      <div style={{ display: "flex", gap: 18 }}>
        {["1967", "2006", "2013", "2022"].map((y, i) => (
          <div key={y} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 28, color: i === 3 ? C.red : C.cyan, padding: "6px 16px", borderRadius: 10,
            border: `2px solid ${i === 3 ? C.red : C.cyan}88`, boxShadow: `0 0 16px ${i === 3 ? C.red : C.cyan}44` }}>{y}</div>
        ))}
      </div>
    </Abs>
    <Overlay />
  </AbsoluteFill>
);
