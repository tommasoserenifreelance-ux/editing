import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../ContoGenerali/theme";
import { IconBubble, Label, Stage } from "../GeneraliPensione/Scenes";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const usePop = (delay: number, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 } });
};

const Coin: React.FC<{ r: number }> = ({ r }) => (
  <g>
    <circle r={r} fill={colors.gold} stroke="#B48F36" strokeWidth={r / 8} />
    <Label x={0} y={r * 0.38} size={r * 1.1} fill="#7A5A12">
      €
    </Label>
  </g>
);

// "sono anche una mamma di due bambini": mum and two kids with a heart.
export const FamilyScene: React.FC<{ kidsAt: number }> = ({ kidsAt }) => {
  const frame = useCurrentFrame();
  const mum = usePop(0, 11);
  const kid1 = usePop(kidsAt, 10);
  const kid2 = usePop(kidsAt + 5, 10);
  const heart = usePop(kidsAt + 10, 8);
  const beat = 1 + Math.max(0, Math.sin(frame / 5)) * 0.08;
  const person = (
    x: number,
    head: number,
    body: number,
    fill: string,
    p: number,
  ) => (
    <g
      transform={`translate(${x} ${940 - body * 0.2}) scale(${interpolate(p, [0, 1], [0.2, 1])})`}
      opacity={Math.min(1, p * 2)}
    >
      <circle cy={-body - head} r={head} fill={fill} />
      <path
        d={`M ${-body * 0.55} 0 Q ${-body * 0.55} ${-body} 0 ${-body} Q ${body * 0.55} ${-body} ${body * 0.55} 0 Z`}
        fill={fill}
      />
    </g>
  );
  return (
    <Stage>
      <ellipse cx={540} cy={950} rx={380} ry={30} fill="rgba(0,0,0,0.25)" />
      {person(540, 78, 360, colors.cream, mum)}
      {person(300, 56, 230, "#F4D9D2", kid1)}
      {person(780, 56, 230, "#F4D9D2", kid2)}
      <g
        transform={`translate(540 300) scale(${heart * beat})`}
        opacity={Math.min(1, heart * 2)}
      >
        <path
          d="M 0 60 C -120 -20 -90 -120 0 -70 C 90 -120 120 -20 0 60 Z"
          fill={colors.red}
          stroke="#fff"
          strokeWidth={10}
        />
      </g>
    </Stage>
  );
};

// "tra sport, scuola e compleanni, il risparmio resta un'intenzione".
export const BusyScene: React.FC<{ at: [number, number, number, number] }> = ({
  at,
}) => {
  const frame = useCurrentFrame();
  const sport = usePop(at[0], 10);
  const school = usePop(at[1], 10);
  const cake = usePop(at[2], 10);
  const piggy = usePop(at[3], 11);
  const fade = interpolate(frame, [at[3] - 4, at[3] + 8], [1, 0.25], clamp);
  const bob = (i: number) => Math.sin(frame / 10 + i) * 6;
  return (
    <Stage>
      <g opacity={fade}>
        <g transform={`translate(0 ${bob(0)})`}>
          <IconBubble x={290} y={400} p={sport} label="SPORT">
            <circle r={80} fill={colors.red} />
            <path
              d="M -80 0 H 80 M 0 -80 V 80 M -56 -56 Q 0 0 -56 56 M 56 -56 Q 0 0 56 56"
              stroke="#fff"
              strokeWidth={8}
              fill="none"
            />
          </IconBubble>
        </g>
        <g transform={`translate(0 ${bob(2)})`}>
          <IconBubble x={790} y={480} p={school} label="SCUOLA">
            <path
              d="M -90 -60 L 0 -40 L 90 -60 L 90 70 L 0 90 L -90 70 Z"
              fill={colors.red}
            />
            <path d="M 0 -40 V 90" stroke="#fff" strokeWidth={8} />
            <path
              d="M -70 -30 L -16 -18 M -70 0 L -16 12 M 70 -30 L 16 -18 M 70 0 L 16 12"
              stroke="#fff"
              strokeWidth={6}
            />
          </IconBubble>
        </g>
        <g transform={`translate(0 ${bob(4)})`}>
          <IconBubble x={420} y={820} p={cake} label="FESTE">
            <rect
              x={-90}
              y={-10}
              width={180}
              height={90}
              rx={14}
              fill={colors.red}
            />
            <rect
              x={-70}
              y={-60}
              width={140}
              height={56}
              rx={12}
              fill={colors.wine}
            />
            {[-40, 0, 40].map((x) => (
              <g key={x}>
                <rect
                  x={x - 6}
                  y={-110}
                  width={12}
                  height={46}
                  rx={4}
                  fill={colors.gold}
                />
                <ellipse cx={x} cy={-122} rx={9} ry={14} fill="#FF9F43" />
              </g>
            ))}
          </IconBubble>
        </g>
      </g>
      {/* savings stay an intention */}
      <g
        transform={`translate(540 640) scale(${interpolate(piggy, [0, 1], [0.3, 1])})`}
        opacity={Math.min(1, piggy * 2)}
      >
        <ellipse cx={0} cy={0} rx={230} ry={170} fill={colors.cream} />
        <circle cx={170} cy={-30} r={70} fill={colors.cream} />
        <ellipse cx={225} cy={-20} rx={34} ry={26} fill="#EADFD6" />
        <circle cx={150} cy={-70} r={12} fill={colors.ink} />
        <path d="M 60 -150 L 110 -230 L 140 -140 Z" fill={colors.cream} />
        {[-140, -60, 60, 140].map((x) => (
          <rect
            key={x}
            x={x - 28}
            y={130}
            width={56}
            height={90}
            rx={20}
            fill={colors.cream}
          />
        ))}
        <rect
          x={-60}
          y={-178}
          width={120}
          height={18}
          rx={9}
          fill={colors.ink}
        />
        <g
          transform={`translate(-260 -260) rotate(${Math.sin(frame / 6) * 8})`}
        >
          <circle r={70} fill="#fff" />
          <Label x={0} y={34} size={100} fill={colors.red}>
            ?
          </Label>
        </g>
      </g>
    </Stage>
  );
};

const MONTHS = [
  "GEN",
  "FEB",
  "MAR",
  "APR",
  "MAG",
  "GIU",
  "LUG",
  "AGO",
  "SET",
  "OTT",
  "NOV",
  "DIC",
];

// "il piano d'accumulo ti toglie ogni pensiero": every month a coin goes in
// by itself.
export const AutoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const step = 4.5;
  const lit = Math.floor(frame / step);
  const check = usePop(MONTHS.length * step + 4, 9);
  return (
    <Stage>
      {MONTHS.map((m, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const on = i <= lit;
        return (
          <g
            key={m}
            transform={`translate(${220 + col * 213} ${250 + row * 120})`}
          >
            <rect
              x={-90}
              y={-46}
              width={180}
              height={92}
              rx={18}
              fill={on ? colors.cream : "rgba(255,255,255,0.15)"}
            />
            <Label
              x={0}
              y={16}
              size={44}
              fill={on ? colors.red : "rgba(255,255,255,0.6)"}
              spacing={3}
            >
              {m}
            </Label>
          </g>
        );
      })}
      {MONTHS.map((m, i) => {
        const t = interpolate(frame, [i * step, i * step + 10], [0, 1], {
          ...clamp,
          easing: Easing.in(Easing.quad),
        });
        if (t <= 0 || t >= 1) return null;
        const col = i % 4;
        return (
          <g
            key={m}
            transform={`translate(${interpolate(t, [0, 1], [220 + col * 213, 540])} ${interpolate(t, [0, 1], [400, 760])})`}
          >
            <Coin r={40} />
          </g>
        );
      })}
      {/* jar */}
      <g transform="translate(540 940)">
        <rect
          x={-200}
          y={-170}
          width={400}
          height={300}
          rx={60}
          fill="rgba(255,255,255,0.18)"
          stroke="#fff"
          strokeWidth={10}
        />
        <clipPath id="autojar">
          <rect x={-190} y={-160} width={380} height={280} rx={52} />
        </clipPath>
        <rect
          clipPath="url(#autojar)"
          x={-200}
          y={120 - Math.min(lit + 1, 12) * 22}
          width={400}
          height={300}
          fill={colors.gold}
        />
        <g
          transform={`translate(190 -170) scale(${check})`}
          opacity={Math.min(1, check * 2)}
        >
          <circle r={62} fill="#fff" />
          <path
            d="M -28 0 l 18 20 l 36 -42"
            fill="none"
            stroke={colors.red}
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </Stage>
  );
};

// "scegli una cifra sostenibile e con il tempo costruirai il tuo progetto".
export const GrowthScene: React.FC<{ growAt: number; flagAt: number }> = ({
  growAt,
  flagAt,
}) => {
  const frame = useCurrentFrame();
  const knob = interpolate(frame, [2, 22], [0, 0.42], {
    ...clamp,
    easing: Easing.out(Easing.back(1.6)),
  });
  const heights = [0.18, 0.3, 0.44, 0.6, 0.78, 1];
  const flag = usePop(flagAt, 9);
  return (
    <Stage>
      {/* slider */}
      <g transform="translate(540 300)">
        <Label x={0} y={-70} size={40} spacing={4}>
          CIFRA SOSTENIBILE
        </Label>
        <rect
          x={-340}
          y={-12}
          width={680}
          height={24}
          rx={12}
          fill="rgba(255,255,255,0.25)"
        />
        <rect
          x={-340}
          y={-12}
          width={680 * knob}
          height={24}
          rx={12}
          fill={colors.cream}
        />
        <g transform={`translate(${-340 + 680 * knob} 0)`}>
          <circle r={40} fill="#fff" />
          <Label x={0} y={16} size={44} fill={colors.red}>
            €
          </Label>
        </g>
      </g>
      {/* growth bars */}
      <g transform="translate(0 1010)">
        <rect
          x={150}
          y={0}
          width={780}
          height={8}
          rx={4}
          fill="rgba(255,255,255,0.5)"
        />
        {heights.map((h, i) => {
          const p = interpolate(
            frame,
            [growAt + i * 9, growAt + i * 9 + 16],
            [0, 1],
            {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            },
          );
          return (
            <rect
              key={i}
              x={190 + i * 120}
              y={-480 * h * p}
              width={84}
              height={480 * h * p}
              rx={14}
              fill={i === heights.length - 1 ? colors.red : colors.cream}
            />
          );
        })}
        <g
          transform={`translate(${190 + 5 * 120 + 42} ${-480 - 30}) scale(${flag})`}
          opacity={Math.min(1, flag * 2)}
        >
          <rect x={-4} y={-150} width={8} height={150} fill="#fff" />
          <path d="M 4 -150 L 110 -122 L 4 -94 Z" fill={colors.gold} />
        </g>
      </g>
    </Stage>
  );
};

// "i 18 anni di tuo figlio, la macchina, l'università".
export const GoalsScene: React.FC<{ at: [number, number, number] }> = ({
  at,
}) => {
  const a = usePop(at[0], 10);
  const b = usePop(at[1], 10);
  const c = usePop(at[2], 10);
  const frame = useCurrentFrame();
  const bob = (i: number) => Math.sin(frame / 10 + i) * 6;
  return (
    <Stage>
      <g transform={`translate(0 ${bob(0)})`}>
        <IconBubble x={300} y={400} p={a} label="18 ANNI">
          <Label x={0} y={52} size={150} fill={colors.red}>
            18
          </Label>
        </IconBubble>
      </g>
      <g transform={`translate(0 ${bob(2)})`}>
        <IconBubble x={780} y={520} p={b} label="AUTO">
          <path
            d="M -100 30 L -80 -20 Q -70 -50 -40 -50 L 40 -50 Q 70 -50 80 -20 L 100 30 Z"
            fill={colors.red}
          />
          <rect
            x={-110}
            y={20}
            width={220}
            height={50}
            rx={18}
            fill={colors.red}
          />
          <path d="M -60 -20 L -48 -40 L 48 -40 L 60 -20 Z" fill="#fff" />
          <circle cx={-60} cy={74} r={24} fill={colors.ink} />
          <circle cx={60} cy={74} r={24} fill={colors.ink} />
        </IconBubble>
      </g>
      <g transform={`translate(0 ${bob(4)})`}>
        <IconBubble x={400} y={850} p={c} label="UNIVERSITÀ">
          <path d="M -110 -20 L 0 -70 L 110 -20 L 0 30 Z" fill={colors.red} />
          <path d="M -60 4 V 50 Q 0 80 60 50 V 4 L 0 30 Z" fill={colors.wine} />
          <path d="M 90 -12 V 50" stroke={colors.gold} strokeWidth={8} />
          <circle cx={90} cy={56} r={12} fill={colors.gold} />
        </IconBubble>
      </g>
    </Stage>
  );
};
