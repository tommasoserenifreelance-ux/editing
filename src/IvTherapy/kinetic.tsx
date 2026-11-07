import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { sec } from "../Testosterone/theme";
import { decode, mont, ref } from "./fx";
import words from "./words.json";

/*
 * Kinetic captions from the references: short white italic phrases with
 * one key word set huge in heavy italic caps (yellow, or red for the
 * negative ones) that decodes into place. Two phrases build up — one
 * left, one right — then the block clears.
 */

export type Word = { w: string; s: number; e: number };
export const WORDS = words as Word[];

const clean = (w: string) => w.replace(/[.,?:!]/g, "");

/** Word-time lookup over a given transcript (the IG cut has its own timings). */
export const makeWt = (list: Word[]) => (text: string, after = 0) => {
  const hit = list.find((x) => x.s >= after - 0.01 && clean(x.w) === text);
  if (!hit) throw new Error(`word not found: ${text} after ${after}`);
  return hit.s;
};

export const wt = makeWt(WORDS);

const YELLOW = new Set(
  "benessere ovunque moda miracolo verità mezzo interessante prezioso personalizzata perché basi intravenosa molecole sanguigno digerente vantaggio concreto 100% utile assorbimento documentate apporto prevenzione migliore solido vero seria personalizzazione misura persona esami obiettivi d'arte sartoriale alimentazione serve valutazione davvero ideale professionista medico".split(
    " ",
  ),
);
const RED_IV = new Set(["truffa", "vezzo", "generica", "tutti", "self-service", "lì"]);

type Chunk = { small: string; big?: string; color?: string; s: number; e: number; bs: number };

export const chunksOf = (
  list: Word[],
  extra: string[] = [],
  /** replace the IV keyword sets entirely (other videos) */
  sets?: { yellow: string[]; red: string[] },
): Chunk[] => {
  const YELLOW_X = sets ? new Set(sets.yellow) : new Set([...YELLOW, ...extra]);
  const RED = sets ? new Set(sets.red) : RED_IV;
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    const last = cur[cur.length - 1];
    const key = clean(last.w).toLowerCase();
    const big = YELLOW_X.has(key) || RED.has(key);
    out.push({
      small: (big ? cur.slice(0, -1) : cur).map((x) => x.w).join(" "),
      big: big ? clean(last.w).toUpperCase() : undefined,
      color: RED.has(key) ? ref.red : ref.yellow,
      s: cur[0].s,
      e: last.e,
      bs: last.s,
    });
    cur = [];
  };
  list.forEach((x, i) => {
    cur.push(x);
    const key = clean(x.w).toLowerCase();
    const next = list[i + 1];
    if (!next) return flush();
    if (YELLOW_X.has(key) || RED.has(key)) return flush();
    if (/[.?:!]$/.test(x.w)) return flush();
    if (cur.length >= 4) return flush();
  });
  flush();
  return out;
};

export const CHUNKS = chunksOf(WORDS);

const Phrase: React.FC<{ c: Chunk; slot: number; until: number }> = ({ c, slot, until }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const smallSize = vertical ? 54 : 46;
  // slot 0 upper-left, slot 1 lower-right (around the speaker, as in the reference)
  const x = vertical ? (slot === 0 ? 0.07 : 0.2) : slot === 0 ? 0.2 : 0.5;
  const base = vertical ? (c.big && c.big.length > 10 ? 96 : 128) : c.big && c.big.length > 12 ? 96 : 118;
  // never run past the right edge: fit the big word into the width left after x
  const room = width * (1 - x) - (c.small ? width * 0.04 : 0) - width * 0.05;
  const bigSize = Math.min(base, room / (Math.max(c.big?.length ?? 1, 1) * 0.8));
  const y = vertical ? (slot === 0 ? 0.56 : 0.69) : slot === 0 ? 0.52 : 0.66;
  const inK = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const out = interpolate(frame, [until - 3, until], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bigAt = sec(c.bs - c.s); // the big word decodes as it is spoken
  return (
    <div
      style={{
        position: "absolute",
        left: width * x,
        top: height * y,
        opacity: out,
        transform: `translateY(${(1 - inK) * 14}px)`,
        textShadow: "0 3px 14px rgba(0,0,0,0.65)",
        maxWidth: width * (vertical ? 0.86 : 0.6),
      }}
    >
      {c.small ? (
        <div style={{ fontFamily: mont, fontWeight: 600, fontStyle: "italic", fontSize: smallSize, lineHeight: 1.05, color: "#fff", letterSpacing: "-0.01em", opacity: inK }}>
          {c.small}
        </div>
      ) : null}
      {c.big ? (
        <div
          style={{
            marginLeft: c.small ? width * 0.04 : 0,
            fontFamily: mont,
            fontWeight: 900,
            fontStyle: "italic",
            fontSize: bigSize,
            lineHeight: 0.98,
            color: c.color,
            letterSpacing: "-0.01em",
            WebkitTextStroke: "2px rgba(0,0,0,0.25)",
          }}
        >
          {decode(c.big, frame, bigAt, 8)}
        </div>
      ) : null}
    </div>
  );
};

/** Kinetic captions for the speaker shots; `visible(t)` says whether a chunk may show. */
export const Kinetic: React.FC<{
  visible: (t: number) => { on: boolean; end: number };
  chunks?: Chunk[];
}> = ({ visible, chunks: CH = CHUNKS }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {CH.map((c, i) => {
      const { on, end } = visible(c.s + 0.01);
      if (!on) return null;
      // blocks of two phrases: a phrase stays until the next block starts
      const slot = i % 2;
      const nextBlock = CH[slot === 0 ? i + 2 : i + 1];
      const until = Math.min(nextBlock ? nextBlock.s : c.e + 1, c.e + 1.6, end);
      const from = sec(c.s);
      const dur = Math.max(2, sec(until) - from);
      return (
        <Sequence key={i} from={from} durationInFrames={dur} layout="none">
          <Phrase c={c} slot={slot} until={dur} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
