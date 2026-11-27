import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Background, Overlay } from "./components/Background";
import { Captions } from "./components/Captions";
import { Hud, ChapterCard } from "./components/Hud";
import { ShotCtx, lerp } from "./components/anim";
import { SHOTS } from "./timeline";
import { SCENES } from "./scenes";
import { C } from "./theme";

const OUT = 7; // exit overlap frames
const ch5 = SHOTS.find((s) => s.id === "g1")!.start;
const ch6 = SHOTS.find((s) => s.id === "k1")!.start;

const ShotWrap: React.FC<{ i: number; dur: number; children: React.ReactNode }> = ({ i, dur, children }) => {
  const f = useCurrentFrame();
  const kind = i % 3;
  const enter = lerp(f, 0, 10);
  const exit = lerp(f, dur, dur + OUT, 0, 1);
  const prog = f / Math.max(1, dur);
  // continuous camera drift
  const zoom = 1 + 0.06 * prog;
  const driftX = Math.sin(i * 1.7) * 18 * prog;
  const driftY = Math.cos(i * 2.3) * 12 * prog;
  let tx = 0, ty = 0, sc = 1, blur = 0;
  if (kind === 0) { sc = 1.18 - 0.18 * enter; blur = (1 - enter) * 18; }
  if (kind === 1) { ty = (1 - enter) * 160; blur = (1 - enter) * 14; }
  if (kind === 2) { tx = (1 - enter) * 260 * (i % 2 ? 1 : -1); blur = (1 - enter) * 22; }
  sc *= 1 - exit * 0.08; blur += exit * 16;
  return (
    <AbsoluteFill style={{ opacity: Math.min(enter * 1.4, 1) * (1 - exit), transform: `translate(${tx + driftX}px,${ty + driftY}px) scale(${sc * zoom})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};

const Flash: React.FC<{ color: string }> = ({ color }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 2, 12], [0, 0.55, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${color}, transparent 70%)`, opacity: o, mixBlendMode: "screen" }} />;
};

export const Documentary: React.FC = () => {
  const f = useCurrentFrame();
  const crisis = interpolate(f, [ch5 - 4, ch5 + 6, ch6 - 10, ch6 + 20], [0, 1, 1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      <Background crisis={crisis} hue={0} />
      {SHOTS.map((s, i) => {
        const Scene = SCENES[s.scene];
        if (!Scene) throw new Error("missing scene " + s.scene);
        const dur = s.end - s.start;
        return (
          <Sequence key={s.id} from={s.start} durationInFrames={dur + OUT} name={`${s.id} · ${s.scene}`}>
            <ShotCtx.Provider value={s}>
              <ShotWrap i={i} dur={dur}><Scene /></ShotWrap>
              {s.chapter && <ChapterCard n={s.chapter[0]} name={s.chapter[1]} color={s.chapter[0] === 5 ? C.red : C.cyan} />}
              {s.chapter && <Flash color={s.chapter[0] === 5 ? C.red : C.blue} />}
            </ShotCtx.Provider>
          </Sequence>
        );
      })}
      <Hud crisis={crisis} />
      <Captions crisis={crisis} />
      <Overlay />
      <Audio src={staticFile("audio/master.wav")} />
    </AbsoluteFill>
  );
};
