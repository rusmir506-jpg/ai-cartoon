import React from "react";
import { Composition } from "remotion";
import { Documentary } from "./Documentary";
import { FPS, TOTAL_FRAMES } from "./timeline";
import "./fonts";

export const RemotionRoot: React.FC = () => (
  <Composition id="Tinkov" component={Documentary} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
