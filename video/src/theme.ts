export const C = {
  bg0: "#04050d",
  bg1: "#0a1440",
  bg2: "#2a1060",
  cyan: "#3ef0ff",
  blue: "#4d7cff",
  violet: "#a35bff",
  magenta: "#ff4fd8",
  gold: "#ffd84d",
  red: "#ff3b5c",
  green: "#3dffa0",
  white: "#f2f5ff",
  dim: "rgba(190,205,255,0.55)",
  line: "rgba(120,150,255,0.25)",
};
export const F = {
  head: "'Unbounded', sans-serif",
  body: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
};
export const glow = (c: string, s = 1) =>
  `drop-shadow(0 0 ${6 * s}px ${c}) drop-shadow(0 0 ${18 * s}px ${c}aa)`;
export const textGlow = (c: string, s = 1) =>
  `0 0 ${8 * s}px ${c}, 0 0 ${24 * s}px ${c}99, 0 0 ${48 * s}px ${c}55`;
