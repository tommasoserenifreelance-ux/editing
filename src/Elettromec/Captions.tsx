import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, sans } from "./theme";

export type Word = { w: string; s: number; e: number };

type Group = { words: Word[]; key: number; start: number; end: number };

const STOP = new Set(
  "il lo la le gli un una uno di da in con su per tra fra che e è a al ai alla del della dei delle nel ma se non mi ti ci vi si ho ha sono".split(
    " ",
  ),
);

const clean = (w: string) => w.replace(/[.,;:…]+$/g, "").replace(/\.\.\.$/, "");

// Split the transcript into 1-3 word bursts, breaking on punctuation and pauses.
const groupWords = (words: Word[]): Group[] => {
  const groups: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((word, i) => {
    const prev = words[i - 1];
    const chars = cur.reduce((n, x) => n + x.w.length, 0);
    if (
      cur.length > 0 &&
      (cur.length >= 3 ||
        /[.,?!…;:]$/.test(prev.w) ||
        word.s - prev.e > 0.35 ||
        chars + word.w.length > 20)
    ) {
      groups.push(cur);
      cur = [];
    }
    cur.push(word);
  });
  if (cur.length) groups.push(cur);

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
    const next = groups[i + 1];
    const end = Math.min(g[g.length - 1].e + 0.25, next ? next[0].s : Infinity);
    return { words: g, key, start: g[0].s, end };
  });
};

const KEY_COLORS = [colors.lime, colors.lime, colors.violet];

const PopWord: React.FC<{
  word: Word;
  groupStart: number;
  style: React.CSSProperties;
}> = ({ word, groupStart, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - Math.round((word.s - groupStart) * fps);
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 220 },
  });
  return (
    <span
      style={{
        display: "inline-block",
        opacity: local < 0 ? 0 : 1,
        transform: `translateY(${interpolate(pop, [0, 1], [24, 0])}px) scale(${interpolate(pop, [0, 1], [0.4, 1])})`,
        ...style,
      }}
    >
      {clean(word.w)}
    </span>
  );
};

const small: React.CSSProperties = {
  fontFamily: sans,
  fontWeight: 800,
  fontSize: 50,
  color: colors.white,
  margin: "0 9px",
  textShadow: `0 4px 0 ${colors.navyDeep}, 0 0 18px rgba(0,0,0,0.55)`,
  WebkitTextStroke: `2px ${colors.navyDeep}`,
  paintOrder: "stroke fill",
};

const GroupView: React.FC<{ group: Group; index: number }> = ({
  group,
  index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = (group.end - group.start) * fps;
  const out = interpolate(frame, [duration - 4, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const key = group.words[group.key];
  const keyText = clean(key.w).toUpperCase();
  const keySize = Math.min(124, 980 / (keyText.length * 0.74));
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
        gap: 6,
      }}
    >
      {line(before)}
      <PopWord
        word={{ ...key, w: keyText }}
        groupStart={group.start}
        style={{
          fontFamily: sans,
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: keySize,
          color: KEY_COLORS[index % KEY_COLORS.length],
          letterSpacing: -1,
          WebkitTextStroke: `5px ${colors.navyDeep}`,
          paintOrder: "stroke fill",
          textShadow: `6px 7px 0 ${colors.navyDeep}, 0 0 30px rgba(0,0,0,0.45)`,
          padding: "0 12px",
        }}
      />
      {line(after)}
    </div>
  );
};

export const Captions: React.FC<{
  words: Word[];
  y: number;
  hide?: [number, number][];
}> = ({ words, y, hide = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = React.useMemo(() => groupWords(words), [words]);
  const index = groups.findIndex((g) => t >= g.start && t < g.end);
  if (index < 0) return null;
  const group = groups[index];
  if (hide.some(([a, b]) => group.start < b && group.end > a)) return null;

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
          <GroupView group={group} index={index} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
