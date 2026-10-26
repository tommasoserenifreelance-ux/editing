import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { captionFont, colors } from "./theme";

export type Word = { w: string; s: number; e: number };

type Group = { words: Word[]; key: number; start: number; end: number };

const STOP = new Set(
  "il lo la le gli un una uno di da in con su per tra fra che e è a al ai alla del della dei delle nel ma se non mi ti ci vi si ho ha sono".split(
    " ",
  ),
);

// Captions carry no punctuation, like the references.
const clean = (w: string) => w.replace(/(\.\.\.|[.,;:…?!])+$/g, "");

// Yellow only for the words worth stressing: long content words, numbers, the brand.
export const isEmphasis = (w: string) => {
  const c = clean(w);
  return c.length >= 7 || /\d/.test(c) || /elettromec|sos/i.test(c);
};

// Split the transcript into 1-3 word bursts, breaking on punctuation, pauses
// and shot changes (`cuts`, seconds) so a caption never runs across a cut.
// `soft` makes whole phrases (up to ~7 words), broken only on sentence ends and pauses.
export const groupWords = (
  words: Word[],
  cuts: number[] = [],
  soft = false,
): Group[] => {
  const cutBetween = (a: number, b: number) =>
    cuts.some((c) => c > a && c <= b);
  const maxWords = soft ? 7 : 3;
  const maxChars = soft ? 34 : 20;
  const stop = soft ? /[.?!…]$/ : /[.,?!…;:]$/;
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((word, i) => {
    const prev = words[i - 1];
    const chars = cur.reduce((n, x) => n + x.w.length, 0);
    // The last word before a cut joins the current caption instead of flashing alone.
    const next = words[i + 1];
    const lastBeforeCut = next !== undefined && cutBetween(word.s, next.s);
    const full = cur.length >= maxWords || chars + word.w.length > maxChars;
    if (
      cur.length > 0 &&
      ((full && !(lastBeforeCut && cur.length < 4)) ||
        stop.test(prev.w) ||
        word.s - prev.e > (soft ? 0.6 : 0.35) ||
        cutBetween(prev.s, word.s))
    ) {
      groups.push(cur);
      cur = [];
    }
    cur.push(word);
  });
  if (cur.length) groups.push(cur);

  // Soft phrases never end on a dangling little word ("…un recapito e le"):
  // those move to the start of the next phrase.
  if (soft) {
    const TRAIL = new Set(
      "e ed o le la lo il i gli un una uno di da a al in su per con che ma se mi ti ci vi si non".split(
        " ",
      ),
    );
    for (let i = 0; i < groups.length - 1; i++) {
      const g = groups[i];
      while (
        g.length > 1 &&
        !stop.test(g[g.length - 1].w) &&
        TRAIL.has(clean(g[g.length - 1].w).toLowerCase())
      ) {
        groups[i + 1].unshift(g.pop() as Word);
      }
    }
  }

  return groups.map((g, i) => {
    let key = g.length - 1;
    let best = 0;
    g.forEach((x, k) => {
      const len = clean(x.w).length;
      if (!STOP.has(clean(x.w).toLowerCase()) && len >= best) {
        best = len;
        key = k;
      }
    });
    // Stay up until the next caption unless there's a real pause, and never past a cut.
    const next = groups[i + 1];
    const last = g[g.length - 1];
    const nextCut = Math.min(...cuts.filter((c) => c > g[0].s), Infinity);
    const end = Math.min(
      next && next[0].s - last.e < 1 ? next[0].s : last.e + 0.6,
      next ? next[0].s : Infinity,
      nextCut,
    );
    return { words: g, key, start: g[0].s, end };
  });
};

const PopWord: React.FC<{
  word: Word;
  groupStart: number;
  style: React.CSSProperties;
}> = ({ word, groupStart, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - Math.round((word.s - groupStart) * fps);
  // Gentle settle with no bounce, so words are readable as soon as they land.
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 200, stiffness: 260 },
    durationInFrames: 6,
  });
  return (
    <span
      style={{
        display: "inline-block",
        opacity:
          local < 0
            ? 0
            : interpolate(pop, [0, 0.5], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(pop, [0, 1], [10, 0])}px) scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
        ...style,
      }}
    >
      {clean(word.w)}
    </span>
  );
};

// `heavy` thickens the outline for footage where yellow sits on a bright background.
const outlineFor = (heavy: boolean): React.CSSProperties => ({
  WebkitTextStroke: heavy ? "7px #000000" : "3px rgba(0,0,0,0.55)",
  paintOrder: "stroke fill",
  textShadow: heavy
    ? "0 5px 0 rgba(0,0,0,0.6), 0 0 28px rgba(0,0,0,0.75)"
    : "0 4px 0 rgba(0,0,0,0.35), 0 0 24px rgba(0,0,0,0.55)",
});

const GroupView: React.FC<{ group: Group; heavy: boolean }> = ({
  group,
  heavy,
}) => {
  const outline = outlineFor(heavy);
  const small: React.CSSProperties = {
    ...outline,
    fontFamily: captionFont,
    fontWeight: 700,
    fontSize: 54,
    color: colors.white,
    margin: "0 8px",
  };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = (group.end - group.start) * fps;
  const out = interpolate(frame, [duration - 2, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const key = group.words[group.key];
  const keyText = clean(key.w);
  const keySize = Math.min(112, 1000 / (keyText.length * 0.68));
  const before = group.words.slice(0, group.key);
  const after = group.words.slice(group.key + 1);
  const line = (ws: Word[]) =>
    ws.length > 0 && (
      <div>
        {ws.map((w, i) => (
          <PopWord key={i} word={w} groupStart={group.start} style={small} />
        ))}
      </div>
    );

  return (
    <div
      style={{
        opacity: out,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1,
        gap: 4,
      }}
    >
      {line(before)}
      <PopWord
        word={key}
        groupStart={group.start}
        style={{
          ...outline,
          fontFamily: captionFont,
          fontWeight: 800,
          fontSize: keySize,
          color: isEmphasis(key.w) ? colors.yellow : colors.white,
          letterSpacing: -1,
          padding: "0 10px",
        }}
      />
      {line(after)}
    </div>
  );
};

// Calm captions for cinematic pieces: the whole phrase fades in, plain white.
const SoftGroupView: React.FC<{ group: Group }> = ({ group }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = (group.end - group.start) * fps;
  const o = interpolate(frame, [0, 6, duration - 5, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        opacity: o,
        transform: `translateY(${interpolate(o, [0, 1], [8, 0])}px)`,
        maxWidth: 1000,
        textAlign: "center",
        textWrap: "balance",
        fontFamily: captionFont,
        fontWeight: 700,
        fontSize: 54,
        lineHeight: 1.25,
        color: colors.white,
        textShadow: "0 3px 12px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.9)",
      }}
    >
      {group.words.map((w) => clean(w.w)).join(" ")}
    </div>
  );
};

export const Captions: React.FC<{
  words: Word[];
  y: number;
  cuts: number[];
  heavy?: boolean;
  soft?: boolean;
}> = ({ words, y, cuts, heavy = false, soft = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = React.useMemo(
    () => groupWords(words, cuts, soft),
    [words, cuts, soft],
  );
  const index = groups.findIndex((g) => t >= g.start && t < g.end);
  if (index < 0) return null;
  const group = groups[index];

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: y,
          left: 40,
          right: 40,
          display: "flex",
          justifyContent: "center",
          transform: "translateY(-50%)",
        }}
      >
        <Sequence
          key={index}
          from={Math.round(group.start * fps)}
          layout="none"
        >
          {soft ? (
            <SoftGroupView group={group} />
          ) : (
            <GroupView group={group} heavy={heavy} />
          )}
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
