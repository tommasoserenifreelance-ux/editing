import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, condensed } from "../ContoGenerali/theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const usePop = (delay: number, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 } });
};

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  >
    {children}
  </svg>
);

const Label: React.FC<{
  x: number;
  y: number;
  size: number;
  children: React.ReactNode;
  fill?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
  spacing?: number;
}> = ({
  x,
  y,
  size,
  children,
  fill = "#fff",
  weight = 800,
  anchor = "middle",
  spacing = 0,
}) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={condensed}
    fontWeight={weight}
    fontSize={size}
    letterSpacing={spacing}
    fill={fill}
  >
    {children}
  </text>
);

// "tra vent'anni": a calendar whose year rolls forward twenty years.
export const YearsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const roll = interpolate(frame, [6, 34], [0, 20], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const year = 2026 + Math.round(roll);
  const badge = usePop(34, 9);
  const flip = Math.round(roll) !== roll ? Math.sin(frame * 1.7) * 3 : 0;
  return (
    <Stage>
      <g
        transform={`translate(540 640) scale(${interpolate(enter, [0, 1], [0.6, 1])}) rotate(${-4 + flip})`}
        opacity={Math.min(1, enter * 1.5)}
      >
        <rect
          x={-270}
          y={-300}
          width={540}
          height={600}
          rx={44}
          fill={colors.cream}
        />
        <rect
          x={-270}
          y={-300}
          width={540}
          height={170}
          rx={44}
          fill={colors.red}
        />
        <rect x={-270} y={-180} width={540} height={50} fill={colors.red} />
        {[-150, 150].map((x) => (
          <rect
            key={x}
            x={x - 16}
            y={-340}
            width={32}
            height={90}
            rx={16}
            fill="#2A2224"
          />
        ))}
        <Label x={0} y={-188} size={64} spacing={6}>
          ANNO
        </Label>
        <Label x={0} y={110} size={210} fill={colors.ink}>
          {year}
        </Label>
        <rect x={-200} y={170} width={400} height={10} rx={5} fill="#E2D8CF" />
        <rect
          x={-200}
          y={170}
          width={400 * (roll / 20)}
          height={10}
          rx={5}
          fill={colors.red}
        />
      </g>
      <g
        transform={`translate(830 330) rotate(12) scale(${interpolate(badge, [0, 1], [2.2, 1])})`}
        opacity={Math.min(1, badge * 2)}
      >
        <circle r={120} fill="#fff" />
        <circle r={106} fill="none" stroke={colors.red} strokeWidth={8} />
        <Label x={0} y={18} size={92} fill={colors.red}>
          +20
        </Label>
        <Label x={0} y={62} size={30} fill={colors.red} spacing={4}>
          ANNI
        </Label>
      </g>
    </Stage>
  );
};

const IconBubble: React.FC<{
  x: number;
  y: number;
  p: number;
  label: string;
  children: React.ReactNode;
}> = ({ x, y, p, label, children }) => (
  <g
    transform={`translate(${x} ${y}) scale(${interpolate(p, [0, 1], [0.2, 1])})`}
    opacity={Math.min(1, p * 2)}
  >
    <circle r={150} fill="#fff" />
    <circle
      r={150}
      fill="none"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth={18}
    />
    {children}
    <g transform="translate(0 190)">
      <rect
        x={-150}
        y={-46}
        width={300}
        height={70}
        rx={14}
        fill={colors.red}
      />
      <Label x={0} y={8} size={44} spacing={2}>
        {label}
      </Label>
    </g>
  </g>
);

// "aiutare i tuoi figli, un viaggio, una cena": three life moments pop in.
export const LifeScene: React.FC<{ at: [number, number, number] }> = ({
  at,
}) => {
  const kids = usePop(at[0], 10);
  const trip = usePop(at[1], 10);
  const dinner = usePop(at[2], 10);
  const frame = useCurrentFrame();
  const bob = (i: number) => Math.sin(frame / 10 + i) * 6;
  return (
    <Stage>
      <g transform={`translate(0 ${bob(0)})`}>
        <IconBubble x={300} y={420} p={kids} label="FIGLI">
          {/* parent and child */}
          <circle cx={-38} cy={-58} r={30} fill={colors.red} />
          <path
            d="M -88 70 Q -88 -14 -38 -14 Q 12 -14 12 70 Z"
            fill={colors.red}
          />
          <circle cx={48} cy={-6} r={22} fill={colors.wine} />
          <path d="M 12 70 Q 12 22 48 22 Q 84 22 84 70 Z" fill={colors.wine} />
        </IconBubble>
      </g>
      <g transform={`translate(0 ${bob(2)})`}>
        <IconBubble x={780} y={560} p={trip} label="VIAGGI">
          {/* plane */}
          <g transform="rotate(-30)">
            <path
              d="M -90 0 L 90 0 Q 110 0 110 -2 Q 110 -14 90 -14 L -60 -14 L -90 -40 L -104 -40 L -84 -6 Z"
              fill={colors.red}
            />
            <path
              d="M -10 -14 L 40 -80 L 60 -80 L 30 -14 Z"
              fill={colors.red}
            />
            <path d="M -10 0 L 40 66 L 60 66 L 30 0 Z" fill={colors.wine} />
          </g>
        </IconBubble>
      </g>
      <g transform={`translate(0 ${bob(4)})`}>
        <IconBubble x={380} y={850} p={dinner} label="CENE">
          {/* plate with cutlery */}
          <circle r={70} fill="none" stroke={colors.red} strokeWidth={14} />
          <circle r={40} fill="none" stroke={colors.wine} strokeWidth={6} />
          <rect
            x={-112}
            y={-60}
            width={12}
            height={120}
            rx={6}
            fill={colors.red}
          />
          <path
            d="M -120 -60 v 40 M -106 -60 v 40 M -92 -60 v 40"
            stroke={colors.red}
            strokeWidth={6}
            strokeLinecap="round"
          />
          <path
            d="M 100 -60 Q 124 -20 106 10 L 106 60"
            stroke={colors.red}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
          />
        </IconBubble>
      </g>
    </Stage>
  );
};

// "un passo per volta": a staircase builds one step at a time.
export const StepsScene: React.FC<{ stepsAt: number[] }> = ({ stepsAt }) => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const pops = [
    usePop(stepsAt[0], 10),
    usePop(stepsAt[1], 10),
    usePop(stepsAt[2], 10),
    usePop(stepsAt[3], 10),
    usePop(stepsAt[4], 10),
  ];
  const flag = usePop(stepsAt[4] + 6, 9);
  const climber = interpolate(
    frame,
    stepsAt.map((s) => s + 6),
    stepsAt.map((_, i) => i),
    clamp,
  );
  const stepW = 150;
  const stepH = 110;
  const base = { x: 540 - (stepW * 5) / 2, y: 1000 };
  return (
    <Stage>
      <g opacity={Math.min(1, enter * 1.5)}>
        {pops.map((p, i) => (
          <g
            key={i}
            transform={`translate(${base.x + i * stepW} ${base.y - (i + 1) * stepH + interpolate(p, [0, 1], [180, 0])})`}
            opacity={Math.min(1, p * 2)}
          >
            <rect
              width={stepW - 8}
              height={(i + 1) * stepH}
              rx={12}
              fill={i % 2 === 0 ? colors.cream : "#EADFD6"}
            />
            <rect width={stepW - 8} height={18} rx={9} fill={colors.red} />
            <Label x={(stepW - 8) / 2} y={80} size={54} fill={colors.wine}>
              {i + 1}
            </Label>
          </g>
        ))}
        {/* coin climbing the steps */}
        <g
          transform={`translate(${base.x + climber * stepW + 70} ${base.y - (Math.floor(climber) + 1) * stepH - 60 - Math.abs(Math.sin(climber * Math.PI)) * 60})`}
        >
          <circle r={44} fill={colors.gold} stroke="#B48F36" strokeWidth={6} />
          <Label x={0} y={18} size={52} fill="#7A5A12">
            €
          </Label>
        </g>
        <g
          transform={`translate(${base.x + 4 * stepW + 110} ${base.y - 5 * stepH}) scale(${flag})`}
        >
          <rect x={-4} y={-170} width={8} height={170} fill="#fff" />
          <path d="M 4 -170 L 110 -140 L 4 -110 Z" fill={colors.red} />
        </g>
      </g>
    </Stage>
  );
};

// "la pensione pubblica da sola potrebbe non bastare": bars with a gap.
export const GapScene: React.FC<{ gapAt: number }> = ({ gapAt }) => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const full = interpolate(frame, [4, 24], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const pub = interpolate(frame, [12, 32], [0, 0.62], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const gap = usePop(gapAt, 10);
  const dash = (frame * 2) % 40;
  const barH = 560;
  const y0 = 1000;
  return (
    <Stage>
      <g opacity={Math.min(1, enter * 1.5)}>
        <rect
          x={180}
          y={y0 + 6}
          width={720}
          height={8}
          rx={4}
          fill="rgba(255,255,255,0.5)"
        />
        {/* lifestyle */}
        <rect
          x={250}
          y={y0 - barH * full}
          width={220}
          height={barH * full}
          rx={18}
          fill={colors.cream}
        />
        <Label x={360} y={y0 + 70} size={40}>
          TENORE DI VITA
        </Label>
        {/* public pension */}
        <rect
          x={610}
          y={y0 - barH * pub}
          width={220}
          height={barH * pub}
          rx={18}
          fill={colors.red}
        />
        <Label x={720} y={y0 + 70} size={40}>
          PENSIONE PUBBLICA
        </Label>
        {/* the gap */}
        <g opacity={Math.min(1, gap * 2)}>
          <rect
            x={610}
            y={y0 - barH}
            width={220}
            height={barH * (1 - 0.62)}
            rx={18}
            fill="rgba(255,255,255,0.08)"
            stroke="#fff"
            strokeWidth={6}
            strokeDasharray="22 18"
            strokeDashoffset={dash}
          />
          <g
            transform={`translate(720 ${y0 - barH * 0.81}) scale(${interpolate(gap, [0, 1], [1.8, 1])})`}
          >
            <circle r={62} fill="#fff" />
            <Label x={0} y={30} size={92} fill={colors.red}>
              ?
            </Label>
          </g>
        </g>
      </g>
    </Stage>
  );
};

// "versi quando vuoi, versi come vuoi": coins drop into a jar.
export const FlexScene: React.FC<{ whenAt: number; howAt: number }> = ({
  whenAt,
  howAt,
}) => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const drops = [whenAt - 4, whenAt + 6, howAt - 4, howAt + 2, howAt + 8];
  const sizes = [44, 44, 30, 56, 38];
  const landed = drops.filter((d) => frame > d + 12).length;
  return (
    <Stage>
      <g
        opacity={Math.min(1, enter * 1.5)}
        transform={`translate(540 700) scale(${interpolate(enter, [0, 1], [0.7, 1])})`}
      >
        {drops.map((d, i) => {
          const t = interpolate(frame, [d, d + 12], [0, 1], {
            ...clamp,
            easing: Easing.in(Easing.quad),
          });
          if (t <= 0 || t >= 1) return null;
          return (
            <g
              key={i}
              transform={`translate(${(i % 2 === 0 ? -1 : 1) * 30} ${interpolate(t, [0, 1], [-520, -150])})`}
            >
              <circle
                r={sizes[i]}
                fill={colors.gold}
                stroke="#B48F36"
                strokeWidth={5}
              />
              <Label
                x={0}
                y={sizes[i] * 0.38}
                size={sizes[i] * 1.1}
                fill="#7A5A12"
              >
                €
              </Label>
            </g>
          );
        })}
        {/* jar */}
        <rect
          x={-220}
          y={-170}
          width={440}
          height={420}
          rx={70}
          fill="rgba(255,255,255,0.18)"
          stroke="#fff"
          strokeWidth={10}
        />
        <rect
          x={-150}
          y={-210}
          width={300}
          height={56}
          rx={20}
          fill={colors.cream}
        />
        <rect x={-60} y={-196} width={120} height={14} rx={7} fill="#2A2224" />
        <clipPath id="jar">
          <rect x={-210} y={-160} width={420} height={400} rx={62} />
        </clipPath>
        <g clipPath="url(#jar)">
          <rect
            x={-220}
            y={240 - 70 * landed}
            width={440}
            height={70 * landed + 20}
            fill={colors.gold}
            opacity={0.95}
          />
          {Array.from({ length: landed * 3 }).map((_, i) => (
            <ellipse
              key={i}
              cx={-160 + ((i * 97) % 320)}
              cy={240 - 70 * landed + 20 + Math.floor(i / 3) * 70}
              rx={40}
              ry={12}
              fill="#B48F36"
              opacity={0.6}
            />
          ))}
        </g>
      </g>
    </Stage>
  );
};

// "vantaggi fiscali entro il 31 dicembre": a calendar date gets circled.
export const DeadlineScene: React.FC<{ circleAt: number; stampAt: number }> = ({
  circleAt,
  stampAt,
}) => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const shield = usePop(6, 11);
  const draw = interpolate(frame, [circleAt, circleAt + 14], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const stamp = usePop(stampAt, 9);
  const len = 1200;
  return (
    <Stage>
      <g
        transform={`translate(540 680) scale(${interpolate(enter, [0, 1], [0.6, 1])}) rotate(3)`}
        opacity={Math.min(1, enter * 1.5)}
      >
        <rect
          x={-260}
          y={-300}
          width={520}
          height={580}
          rx={44}
          fill={colors.cream}
        />
        <rect
          x={-260}
          y={-300}
          width={520}
          height={160}
          rx={44}
          fill={colors.red}
        />
        <rect x={-260} y={-180} width={520} height={40} fill={colors.red} />
        {[-140, 140].map((x) => (
          <rect
            key={x}
            x={x - 16}
            y={-340}
            width={32}
            height={90}
            rx={16}
            fill="#2A2224"
          />
        ))}
        <Label x={0} y={-196} size={66} spacing={6}>
          DICEMBRE
        </Label>
        <Label x={0} y={140} size={250} fill={colors.ink}>
          31
        </Label>
        <path
          d="M -170 30 C -190 -120 150 -150 175 10 C 195 150 -120 190 -175 60"
          fill="none"
          stroke={colors.red}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={len}
          strokeDashoffset={len * (1 - draw)}
        />
      </g>
      {/* tax benefit shield */}
      <g
        transform={`translate(250 360) rotate(-10) scale(${interpolate(shield, [0, 1], [0.2, 1])})`}
        opacity={Math.min(1, shield * 2)}
      >
        <path
          d="M 0 -110 L 95 -70 Q 95 60 0 120 Q -95 60 -95 -70 Z"
          fill="#fff"
        />
        <Label x={0} y={36} size={110} fill={colors.red}>
          %
        </Label>
      </g>
      <g
        transform={`translate(800 1010) rotate(-12) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`}
        opacity={Math.min(1, stamp * 2)}
      >
        <rect x={-190} y={-62} width={380} height={124} rx={18} fill="#fff" />
        <rect
          x={-176}
          y={-48}
          width={352}
          height={96}
          rx={12}
          fill="none"
          stroke={colors.red}
          strokeWidth={6}
        />
        <Label x={0} y={20} size={56} fill={colors.red} spacing={3}>
          OGNI ANNO
        </Label>
      </g>
    </Stage>
  );
};
