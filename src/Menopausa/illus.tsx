import { colors } from "./theme";

// Flat illustrations with a thick ink outline, matching the template's mascot style.

const S = {
  stroke: colors.ink,
  strokeWidth: 7,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export const Art: React.FC<{
  x: number;
  y: number;
  size: number;
  children: React.ReactNode;
}> = ({ x, y, size, children }) => (
  <svg
    viewBox="0 0 300 300"
    width={size}
    height={size}
    style={{ position: "absolute", left: x, top: y, overflow: "visible" }}
  >
    {children}
  </svg>
);

const Bubbles: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g fill="#FFFFFF" opacity={0.85}>
    {[
      [-60, -50, 11],
      [-30, -75, 7],
      [10, -40, 9],
      [55, -20, 12],
      [-55, 15, 8],
      [25, 30, 10],
      [-15, 60, 13],
      [60, 45, 7],
      [-70, 55, 6],
    ].map(([dx, dy, r], i) => (
      <circle key={i} cx={cx + dx} cy={cy + dy} r={r} />
    ))}
  </g>
);

// Round mascot with a hot flush: sweat drops and a little flame.
export const HotFlush: React.FC = () => (
  <>
    <ellipse cx={150} cy={286} rx={120} ry={12} fill={colors.light} />
    <line x1={118} y1={230} x2={118} y2={280} {...S} />
    <line x1={182} y1={230} x2={182} y2={280} {...S} />
    <ellipse cx={112} cy={281} rx={18} ry={8} fill={colors.ink} />
    <ellipse cx={188} cy={281} rx={18} ry={8} fill={colors.ink} />
    <circle cx={150} cy={150} r={100} fill={colors.accent} {...S} />
    <Bubbles cx={150} cy={150} />
    <path d="M52 160 Q90 110 125 150 T200 140 T252 120" fill="none" {...S} />
    <path
      d="M262 40 q-18 24 -18 36 a18 18 0 0 0 36 0 q0 -12 -18 -36z"
      fill="#FFFFFF"
      {...S}
      strokeWidth={5}
    />
    <path
      d="M30 70 q-12 16 -12 24 a12 12 0 0 0 24 0 q0 -8 -12 -24z"
      fill="#FFFFFF"
      {...S}
      strokeWidth={5}
    />
    <path
      d="M150 -10 C120 20 128 36 136 44 C126 40 118 30 120 18 C100 40 104 62 128 70 L172 70 C196 62 200 36 176 10 C176 26 170 34 162 38 C170 20 164 4 150 -10 Z"
      fill="#FFB547"
      {...S}
      strokeWidth={5}
    />
  </>
);

export const QuestionBubble: React.FC = () => (
  <>
    <path
      d="M60 40 H240 a50 50 0 0 1 50 50 V150 a50 50 0 0 1 -50 50 H150 L200 260 L120 200 H60 a50 50 0 0 1 -50 -50 V90 a50 50 0 0 1 50 -50 Z"
      fill={colors.accent}
      {...S}
    />
    <text
      x={150}
      y={168}
      textAnchor="middle"
      fontFamily="Anton"
      fontSize={130}
      fill="#FFFFFF"
    >
      ?
    </text>
  </>
);

export const Heart: React.FC = () => (
  <>
    <path
      d="M150 270 C60 200 10 150 10 95 C10 50 45 20 85 20 C115 20 138 38 150 62 C162 38 185 20 215 20 C255 20 290 50 290 95 C290 150 240 200 150 270 Z"
      fill={colors.accent}
      {...S}
    />
    <path
      d="M30 140 H100 L120 100 L145 185 L170 75 L190 140 H270"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={12}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </>
);

// Hormone molecule with a falling arrow.
export const FallingHormone: React.FC = () => {
  const hex = (cx: number, cy: number, r: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(" ");
  return (
    <>
      <polygon points={hex(95, 110, 55)} fill={colors.accent} {...S} />
      <polygon points={hex(190, 110, 55)} fill={colors.light} {...S} />
      <polygon points={hex(142, 192, 55)} fill={colors.accent} {...S} />
      <path
        d="M262 120 V250 M232 220 L262 255 L292 220"
        fill="none"
        {...S}
        strokeWidth={10}
      />
    </>
  );
};

// Bone outline: shapes stroked first, then refilled so inner seams disappear.
export const CrackedBone: React.FC = () => {
  const parts = (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx={62} cy={122} r={34} />
      <circle cx={62} cy={178} r={34} />
      <circle cx={238} cy={122} r={34} />
      <circle cx={238} cy={178} r={34} />
      <rect x={60} y={122} width={180} height={56} />
    </g>
  );
  return (
    <g transform="rotate(-25 150 150)">
      {parts({ stroke: colors.ink, strokeWidth: 14, fill: colors.ink })}
      {parts({ fill: "#FFFFFF" })}
      <path
        d="M150 118 L138 138 L158 150 L140 182"
        fill="none"
        stroke={colors.accent}
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};

export const BrainArt: React.FC = () => (
  <>
    <path
      d="M150 45 C130 20 85 25 78 55 C45 55 25 85 38 112 C15 130 18 172 48 185 C45 220 80 245 112 232 C122 255 150 262 150 262 Z"
      fill={colors.accent}
      {...S}
    />
    <path
      d="M150 45 C170 20 215 25 222 55 C255 55 275 85 262 112 C285 130 282 172 252 185 C255 220 220 245 188 232 C178 255 150 262 150 262 Z"
      fill={colors.light}
      {...S}
    />
    <path d="M150 45 V262" fill="none" {...S} />
    <path
      d="M78 55 C95 70 100 90 88 110 M48 185 C70 175 90 180 100 200 M60 130 C80 135 95 150 110 140"
      fill="none"
      {...S}
      strokeWidth={5}
    />
    <path
      d="M222 55 C205 70 200 90 212 110 M252 185 C230 175 210 180 200 200 M240 130 C220 135 205 150 190 140"
      fill="none"
      {...S}
      strokeWidth={5}
    />
  </>
);

// Mascot waving, with a heart above it.
export const Waving: React.FC = () => (
  <>
    <ellipse cx={150} cy={286} rx={110} ry={12} fill={colors.light} />
    <line x1={120} y1={232} x2={120} y2={280} {...S} />
    <line x1={180} y1={232} x2={180} y2={280} {...S} />
    <ellipse cx={114} cy={281} rx={18} ry={8} fill={colors.ink} />
    <ellipse cx={186} cy={281} rx={18} ry={8} fill={colors.ink} />
    <path d="M238 140 L285 75" {...S} />
    <circle cx={150} cy={160} r={90} fill={colors.accent} {...S} />
    <Bubbles cx={150} cy={160} />
    <path d="M70 165 Q105 125 135 160 T205 150 T235 135" fill="none" {...S} />
    <path
      d="M150 50 C120 30 100 10 100 -8 C100 -24 112 -34 125 -34 C137 -34 145 -26 150 -16 C155 -26 163 -34 175 -34 C188 -34 200 -24 200 -8 C200 10 180 30 150 50 Z"
      fill={colors.light}
      {...S}
      strokeWidth={5}
    />
  </>
);
