import React from "react";

// Line icons on a 64x64 grid, drawn on by animating strokeDashoffset
// (same technique as the Zymerex icon set).
type Part = { d: string };

const person = (cx: number, y = 0): Part[] => [
  { d: `M${cx} ${14 + y} a6 6 0 1 1 -0.01 0` },
  { d: `M${cx - 10} ${52 + y} v-10 a10 10 0 0 1 20 0 v10` },
];

export const ICONS = {
  tree: [
    { d: "M32 8 L18 28 H26 L14 44 H50 L38 28 H46 Z" },
    { d: "M32 44 V56 M24 56 H40" },
    {
      d: "M32 2 L33.5 5 L36.5 5.5 L34.2 7.6 L34.8 10.6 L32 9 L29.2 10.6 L29.8 7.6 L27.5 5.5 L30.5 5 Z",
    },
  ],
  people: [...person(13), ...person(32), ...person(51)],
  glass: [
    { d: "M18 8 H46 L32 30 Z" },
    { d: "M32 30 V54 M22 56 H42" },
    { d: "M24 14 H40" },
  ],
  plate: [
    { d: "M34 14 a18 18 0 1 1 -0.01 0" },
    { d: "M34 22 a10 10 0 1 1 -0.01 0" },
    { d: "M4 8 V20 a4 4 0 0 0 8 0 V8 M8 8 V58" },
    { d: "M60 8 C54 14 54 28 60 32 V58" },
  ],
  sliders: [
    { d: "M10 16 H54 M10 32 H54 M10 48 H54" },
    { d: "M24 11 a5 5 0 1 1 -0.01 0" },
    { d: "M42 27 a5 5 0 1 1 -0.01 0" },
    { d: "M20 43 a5 5 0 1 1 -0.01 0" },
  ],
  parking: [
    {
      d: "M16 6 H48 a8 8 0 0 1 8 8 V50 a8 8 0 0 1 -8 8 H16 a8 8 0 0 1 -8 -8 V14 a8 8 0 0 1 8 -8 Z",
    },
    { d: "M25 46 V18 H36 a8 8 0 0 1 0 16 H25" },
  ],
  phone: [
    {
      d: "M20 4 H44 a5 5 0 0 1 5 5 V55 a5 5 0 0 1 -5 5 H20 a5 5 0 0 1 -5 -5 V9 a5 5 0 0 1 5 -5 Z",
    },
    { d: "M22 16 H42 M22 24 H42 M22 32 H34" },
    { d: "M28 52 H36" },
  ],
  star: [
    {
      d: "M32 6 L39.6 22.4 L57 24.4 L44 36.4 L47.6 54 L32 45 L16.4 54 L20 36.4 L7 24.4 L24.4 22.4 Z",
    },
  ],
  pin: [
    { d: "M32 60 C32 60 12 38 12 25 A20 20 0 0 1 52 25 C52 38 32 60 32 60 Z" },
    { d: "M32 18 a7 7 0 1 1 -0.01 0" },
  ],
} satisfies Record<string, Part[]>;

export type IconName = keyof typeof ICONS;

export const Icon: React.FC<{
  name: IconName;
  size: number;
  color?: string;
  progress?: number; // 0..1 draw-on
  stroke?: number;
}> = ({ name, size, color = "#fff", progress = 1, stroke = 3.4 }) => {
  const parts: Part[] = ICONS[name];
  const p = Math.max(0, Math.min(1, progress));
  return (
    <svg
      width={size}
      height={size}
      viewBox="-4 -4 72 72"
      style={{
        overflow: "visible",
        filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))",
      }}
    >
      {parts.map((part, i) => {
        const k = parts.length > 1 ? i / parts.length : 0;
        const local = Math.max(
          0,
          Math.min(1, (p - k * 0.5) / (1 - 0.5 * k || 1)),
        );
        return (
          <path
            key={i}
            d={part.d}
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
