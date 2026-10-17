import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import words from "./words.json";
import { colors, sans, sec } from "./theme";

// g: keep this word in the same caption as the next one.
export type Word = { w: string; s: number; e: number; g?: boolean };
export const WORDS = words as Word[];

/** Start time (s) of the first occurrence of `text` at or after `after`. */
export const wt = (text: string, after = 0) => {
  const hit = WORDS.find(
    (x) => x.s >= after - 0.01 && x.w.replace(/[.,?]/g, "") === text,
  );
  if (!hit) throw new Error(`word not found: ${text} after ${after}`);
  return hit.s;
};

type Chunk = { text: string; s: number; e: number };

// 1–3 words per caption, the way the reference cuts them: break on
// punctuation, never leave a short function word dangling at the end.
const chunk = (list: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    out.push({
      text: cur.map((x) => x.w).join(" "),
      s: cur[0].s,
      e: cur[cur.length - 1].e,
    });
    cur = [];
  };
  list.forEach((x, i) => {
    cur.push(x);
    const next = list[i + 1];
    const chars = cur.map((c) => c.w).join(" ").length;
    const punct = /[.,?]$/.test(x.w);
    const short = x.w.length <= 3 && !punct;
    if (x.g && next) return;
    if (!next || punct) return flush();
    if (cur.length >= 3) return flush();
    if (short) return;
    if (cur.length >= 2 || chars >= 9 || next.s - x.e > 0.2) flush();
  });
  flush();
  return out;
};

export const CHUNKS = chunk(WORDS);

/** Start of the caption chunk containing the word that starts at `t`. */
export const chunkStart = (t: number) =>
  CHUNKS.find((c) => c.s <= t + 0.01 && c.e >= t)?.s ?? t;

export type CaptionMode = "white" | "black" | "none";

const CaptionText: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => {
  const frame = useCurrentFrame();
  const k = Math.min(1, frame / 3);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 700,
          fontSize: 56,
          letterSpacing: "-0.02em",
          color,
          opacity: k,
          transform: `scale(${0.96 + 0.04 * k})`,
          textShadow:
            color === colors.white ? "0 2px 14px rgba(0,0,0,0.45)" : "none",
          maxWidth: 900,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

/** Word-by-word captions; colour and visibility follow the scene underneath. */
export const Captions: React.FC<{
  modeAt: (t: number) => { mode: CaptionMode; end: number };
}> = ({ modeAt }) => (
  <>
    {CHUNKS.map((c, i) => {
      const { mode, end } = modeAt(c.s + 0.01);
      if (mode === "none") return null;
      const next = CHUNKS[i + 1]?.s ?? c.e + 0.6;
      const until = Math.min(next, c.e + 0.6, end);
      const from = sec(c.s);
      return (
        <Sequence
          key={i}
          from={from}
          durationInFrames={Math.max(1, sec(until) - from)}
          layout="none"
        >
          <CaptionText
            text={c.text}
            color={mode === "white" ? colors.white : colors.ink}
          />
        </Sequence>
      );
    })}
  </>
);
