import React from "react";

// Line icons drawn on a 64x64 grid. Every path uses pathLength=1 so it can be
// "drawn on" by animating strokeDashoffset from 1 to 0.
type Part = { d: string; t?: string; fill?: boolean };

const rot = (d: string, n: number): Part[] =>
  Array.from({ length: n }, (_, i) => ({ d, t: `rotate(${(360 / n) * i} 32 32)` }));

const person = (cx: number): Part[] => [
  { d: `M${cx} 14 a6 6 0 1 1 -0.01 0` },
  { d: `M${cx - 10} 52 v-10 a10 10 0 0 1 20 0 v10` },
];

export const ICONS = {
  bolt: [{ d: "M36 6 L16 36 H30 L26 58 L48 26 H34 Z" }],
  belly: [
    { d: "M32 12 a20 20 0 1 1 -0.01 0" },
    { d: "M2 32 h6 M56 32 h6" },
    { d: "M7 26 l-5 6 5 6 M57 26 l5 6 -5 6" },
    { d: "M26 36 a6 6 0 0 0 12 0" },
  ],
  hourglass: [
    { d: "M16 6 H48 M16 58 H48" },
    { d: "M20 6 C20 24 44 24 44 32 C44 40 20 40 20 58" },
    { d: "M44 6 C44 24 20 24 20 32 C20 40 44 40 44 58" },
  ],
  drop: [
    { d: "M32 6 C32 6 14 28 14 40 A18 18 0 0 0 50 40 C50 28 32 6 32 6 Z" },
    { d: "M23 41 a9 9 0 0 0 9 9" },
  ],
  timer: [
    { d: "M32 16 a21 21 0 1 1 -0.01 0" },
    { d: "M25 5 H39 M32 5 V16" },
    { d: "M32 37 V26" },
  ],
  people: [...person(13), ...person(32), ...person(51)],
  person: [{ d: "M32 6 a9 9 0 1 1 -0.01 0" }, { d: "M16 58 v-14 a16 16 0 0 1 32 0 v14" }],
  plate: [
    { d: "M34 14 a18 18 0 1 1 -0.01 0" },
    { d: "M34 22 a10 10 0 1 1 -0.01 0" },
    { d: "M4 8 V20 a4 4 0 0 0 8 0 V8 M8 8 V58" },
    { d: "M60 8 C54 14 54 28 60 32 V58" },
  ],
  lotus: [
    { d: "M32 50 C22 44 18 32 32 16 C46 32 42 44 32 50 Z" },
    { d: "M32 50 C20 52 8 46 6 32 C14 31 22 35 26 42" },
    { d: "M32 50 C44 52 56 46 58 32 C50 31 42 35 38 42" },
    { d: "M14 58 H50" },
  ],
  clock: [{ d: "M32 10 a22 22 0 1 1 -0.01 0" }, { d: "M32 18 V32 L42 38" }],
  wheat: [
    { d: "M32 60 V12" },
    { d: "M32 6 C27 10 27 16 32 20 C37 16 37 10 32 6 Z" },
    ...[22, 34, 46].flatMap((y) => [
      { d: `M32 ${y + 6} C24 ${y + 6} 20 ${y} 20 ${y - 6} C26 ${y - 6} 32 ${y - 2} 32 ${y + 6}` },
      { d: `M32 ${y + 6} C40 ${y + 6} 44 ${y} 44 ${y - 6} C38 ${y - 6} 32 ${y - 2} 32 ${y + 6}` },
    ]),
  ],
  intestine: [
    {
      d: "M14 8 H46 C55 8 55 20 46 20 H18 C9 20 9 32 18 32 H46 C55 32 55 44 46 44 H18 C9 44 9 56 18 56 H40",
    },
  ],
  energy: [
    { d: "M32 6 L54 19 V45 L32 58 L10 45 V19 Z" },
    { d: "M35 16 L23 34 H32 L29 48 L41 30 H32 Z" },
  ],
  flower: [
    ...rot("M32 30 C24 22 25 9 32 6 C39 9 40 22 32 30", 5),
    { d: "M32 27 a5 5 0 1 1 -0.01 0" },
  ],
  leaf: [
    { d: "M10 54 C10 26 28 10 56 8 C56 36 38 54 10 54 Z" },
    { d: "M10 54 L42 22" },
    { d: "M24 40 H36 M30 34 V22" },
  ],
  daisy: [
    ...rot("M32 23 V6", 10),
    { d: "M32 24 a8 8 0 1 1 -0.01 0" },
  ],
  bacteria: [
    { d: "M8 22 a8 8 0 0 1 8 -8 h14 a8 8 0 0 1 0 16 h-14 a8 8 0 0 1 -8 -8 z" },
    { d: "M30 44 a8 8 0 0 1 8 -8 h10 a8 8 0 0 1 0 16 h-10 a8 8 0 0 1 -8 -8 z", t: "rotate(-25 44 44)" },
    { d: "M6 46 a5 5 0 1 1 0.01 0" },
    { d: "M48 12 a4 4 0 1 1 0.01 0" },
  ],
  pill: [
    { d: "M8 32 a12 12 0 0 1 12 -12 h24 a12 12 0 0 1 0 24 h-24 a12 12 0 0 1 -12 -12 z" },
    { d: "M32 20 V44" },
  ],
  brain: [
    {
      d: "M32 12 C26 6 14 10 16 20 C8 22 8 34 14 37 C12 47 22 53 30 49 L32 51 L34 49 C42 53 52 47 50 37 C56 34 56 22 48 20 C50 10 38 6 32 12 Z",
    },
    { d: "M32 12 V50" },
    { d: "M22 26 C26 26 28 30 28 34 M42 26 C38 26 36 30 36 34" },
  ],
  check: [{ d: "M12 34 L26 48 L52 18" }],
  cross: [{ d: "M16 16 L48 48 M48 16 L16 48" }],
  arrow: [{ d: "M6 32 H56 M42 18 L56 32 L42 46" }],
} satisfies Record<string, Part[]>;

export type IconName = keyof typeof ICONS;

export const Icon: React.FC<{
  name: IconName;
  size: number;
  color?: string;
  progress?: number; // 0..1 draw-on
  stroke?: number;
}> = ({ name, size, color = "#fff", progress = 1, stroke = 4.5 }) => {
  const parts: Part[] = ICONS[name];
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg width={size} height={size} viewBox="-4 -4 72 72" style={{ overflow: "visible" }}>
      {parts.map((part, i) => {
        // Stagger the parts a little so multi-part icons build up.
        const k = parts.length > 1 ? i / parts.length : 0;
        const local = Math.max(0, Math.min(1, (p - k * 0.5) / (1 - 0.5 * k || 1)));
        return (
          <path
            key={i}
            d={part.d}
            transform={part.t}
            pathLength={1}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={1}
            strokeDashoffset={1 - local}
          />
        );
      })}
    </svg>
  );
};
