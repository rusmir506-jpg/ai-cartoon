import tl from "./data/timeline.json";
import shotsRaw from "./data/shots.json";

export const FPS = 30;
export const TOTAL_FRAMES = Math.ceil(tl.duration * FPS);
export type Word = { w: string; t0: number; t1: number; seg: string };
export const WORDS: Word[] = tl.words;
export const SEGMENTS = tl.segments;

export const norm = (s: string) => s.toLowerCase().replace(/[«».,:;!?—]/g, "").replace(/ё/g, "е");

/** index of the n-th word in segment `seg` starting with `cue`, searching from `from` */
export const findWord = (seg: string, cue: string, n = 1, from = 0): number => {
  const c = norm(cue);
  let k = 0;
  for (let i = from; i < WORDS.length; i++) {
    if (WORDS[i].seg !== seg) continue;
    const w = norm(WORDS[i].w);
    if ((w === c || (c.length >= 4 && w.startsWith(c))) && ++k === n) return i;
  }
  throw new Error(`cue not found: ${seg}/${cue}`);
};

export type Shot = {
  id: string; scene: string; seg: string; start: number; end: number; // frames
  wordIndex: number; chapter?: [number, string];
  cues: Record<string, number>; // cue word -> frame relative to shot start
};

const LEAD = 0.12;
const raw = shotsRaw as { id: string; seg: string; cue: string; n?: number; scene: string; chapter?: [number, string]; sfx?: [string, string][] }[];
const resolved = raw.map((s) => {
  const segStart = SEGMENTS.find((g) => g.id === s.seg)!;
  const segFirst = WORDS.findIndex((w) => w.seg === s.seg);
  const wi = findWord(s.seg, s.cue, s.n ?? 1, segFirst);
  const t = wi === 0 ? 0 : Math.min(WORDS[wi].t0 - (s.chapter ? 0.3 : LEAD), s.chapter ? segStart.start - 0.15 : 1e9);
  return { ...s, wi, t };
});
export const SHOTS: Shot[] = resolved.map((s, i) => {
  const start = Math.round(s.t * FPS);
  const end = i + 1 < resolved.length ? Math.round(resolved[i + 1].t * FPS) : TOTAL_FRAMES;
  // every word in the shot's span becomes a cue (relative frame), keyed by normalized word
  const cues: Record<string, number> = {};
  for (let k = s.wi; k < WORDS.length && WORDS[k].t0 * FPS < end; k++) {
    const key = norm(WORDS[k].w);
    if (!(key in cues)) cues[key] = Math.round(WORDS[k].t0 * FPS) - start;
  }
  return { id: s.id, scene: s.scene, seg: s.seg, start, end, wordIndex: s.wi, chapter: s.chapter, cues };
});
