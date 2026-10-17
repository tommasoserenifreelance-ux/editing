import { colors } from "./theme";

// Spot illustrations: thin ink line, flat pastel fills, soft round backdrop.

const S = {
  stroke: colors.ink,
  strokeWidth: 5,
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

const Backdrop: React.FC<{ fill: string }> = ({ fill }) => (
  <circle cx={150} cy={150} r={140} fill={fill} />
);

// Round mascot from the template, with heat waves for a hot flush.
export const HotFlush: React.FC = () => (
  <>
    <ellipse cx={150} cy={288} rx={90} ry={9} fill={colors.blueSoft} />
    <line x1={125} y1={240} x2={125} y2={282} {...S} />
    <line x1={175} y1={240} x2={175} y2={282} {...S} />
    <path d="M110 284 h18 M172 284 h18" {...S} strokeWidth={8} />
    <circle cx={150} cy={160} r={88} fill={colors.pink} {...S} />
    <circle cx={112} cy={118} r={10} fill="#FFFFFF" opacity={0.8} />
    <circle cx={134} cy={102} r={5} fill="#FFFFFF" opacity={0.8} />
    <path d="M72 175 Q105 140 135 170 T200 160 T232 148" fill="none" {...S} />
    {[118, 150, 182].map((x, i) => (
      <path
        key={x}
        d={`M${x} ${i === 1 ? 46 : 52} q-10 -12 0 -24 t0 -24`}
        fill="none"
        {...S}
        stroke={colors.pink}
        strokeWidth={6}
      />
    ))}
    <path
      d="M258 96 q-14 18 -14 28 a14 14 0 0 0 28 0 q0 -10 -14 -28z"
      fill={colors.blueSoft}
      {...S}
      strokeWidth={4}
    />
    <path
      d="M40 120 q-10 13 -10 20 a10 10 0 0 0 20 0 q0 -7 -10 -20z"
      fill={colors.blueSoft}
      {...S}
      strokeWidth={4}
    />
  </>
);

export const QuestionBubble: React.FC = () => (
  <>
    <Backdrop fill={colors.pinkSoft} />
    <path
      d="M80 80 H220 a35 35 0 0 1 35 35 V165 a35 35 0 0 1 -35 35 H160 L190 240 L125 200 H80 a35 35 0 0 1 -35 -35 V115 a35 35 0 0 1 35 -35 Z"
      fill="#FFFFFF"
      {...S}
    />
    <text
      x={150}
      y={182}
      textAnchor="middle"
      fontFamily="Anton"
      fontSize={95}
      fill={colors.pink}
    >
      ?
    </text>
  </>
);

export const Heart: React.FC = () => (
  <>
    <Backdrop fill={colors.pinkSoft} />
    <path
      d="M150 245 C85 195 50 160 50 118 C50 85 75 62 105 62 C127 62 142 75 150 92 C158 75 173 62 195 62 C225 62 250 85 250 118 C250 160 215 195 150 245 Z"
      fill="#FFFFFF"
      {...S}
    />
    <path
      d="M62 150 H112 L126 122 L144 182 L162 108 L176 150 H238"
      fill="none"
      {...S}
      stroke={colors.blue}
      strokeWidth={7}
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
      <Backdrop fill={colors.blueSoft} />
      <polygon points={hex(105, 125, 40)} fill={colors.pink} {...S} />
      <polygon points={hex(174, 125, 40)} fill="#FFFFFF" {...S} />
      <polygon points={hex(140, 185, 40)} fill={colors.pinkSoft} {...S} />
      <path
        d="M238 110 V215 M216 192 L238 218 L260 192"
        fill="none"
        {...S}
        stroke={colors.blue}
        strokeWidth={7}
      />
    </>
  );
};

// Bone outline: shapes stroked first, then refilled so inner seams disappear.
export const CrackedBone: React.FC = () => {
  const parts = (props: React.SVGProps<SVGGElement>) => (
    <g {...props}>
      <circle cx={82} cy={130} r={26} />
      <circle cx={82} cy={172} r={26} />
      <circle cx={218} cy={130} r={26} />
      <circle cx={218} cy={172} r={26} />
      <rect x={80} y={130} width={140} height={42} />
    </g>
  );
  return (
    <>
      <Backdrop fill={colors.blueSoft} />
      <g transform="rotate(-25 150 150)">
        {parts({ stroke: colors.ink, strokeWidth: 10, fill: colors.ink })}
        {parts({ fill: "#FFFFFF" })}
        <path
          d="M152 126 L142 142 L158 152 L144 176"
          fill="none"
          {...S}
          stroke={colors.pink}
          strokeWidth={6}
        />
      </g>
    </>
  );
};

// Brain split in rose and blue: women vs men on the same slide.
export const BrainArt: React.FC = () => (
  <>
    <Backdrop fill={colors.pinkSoft} />
    <path
      d="M150 70 C135 52 102 56 97 78 C73 78 58 100 68 120 C51 133 54 163 76 172 C74 198 100 216 124 206 C131 223 150 228 150 228 Z"
      fill={colors.pink}
      {...S}
    />
    <path
      d="M150 70 C165 52 198 56 203 78 C227 78 242 100 232 120 C249 133 246 163 224 172 C226 198 200 216 176 206 C169 223 150 228 150 228 Z"
      fill={colors.blueSoft}
      {...S}
    />
    <path
      d="M97 78 C110 90 113 104 104 118 M76 172 C92 165 106 168 114 182 M86 138 C100 142 111 152 122 145"
      fill="none"
      {...S}
      strokeWidth={3.5}
    />
    <path
      d="M203 78 C190 90 187 104 196 118 M224 172 C208 165 194 168 186 182 M214 138 C200 142 189 152 178 145"
      fill="none"
      {...S}
      strokeWidth={3.5}
    />
  </>
);

// Mascot waving, with a small heart above it.
export const Waving: React.FC = () => (
  <>
    <ellipse cx={150} cy={288} rx={85} ry={9} fill={colors.pinkSoft} />
    <line x1={125} y1={240} x2={125} y2={282} {...S} />
    <line x1={175} y1={240} x2={175} y2={282} {...S} />
    <path d="M110 284 h18 M172 284 h18" {...S} strokeWidth={8} />
    <path d="M228 150 L268 92" {...S} />
    <circle cx={150} cy={165} r={82} fill={colors.blue} {...S} />
    <circle cx={115} cy={128} r={9} fill="#FFFFFF" opacity={0.8} />
    <circle cx={136} cy={113} r={5} fill="#FFFFFF" opacity={0.8} />
    <path d="M78 178 Q108 145 136 172 T196 162 T226 152" fill="none" {...S} />
    <path
      d="M150 62 C128 47 114 34 114 20 C114 9 122 2 132 2 C140 2 146 7 150 14 C154 7 160 2 168 2 C178 2 186 9 186 20 C186 34 172 47 150 62 Z"
      fill={colors.pink}
      {...S}
      strokeWidth={4}
    />
  </>
);
