import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, condensed } from "./theme";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const usePop = (delay: number, damping = 11) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, mass: 0.7 } });
};

// Wine-red backdrop with moving diagonal light bands and a glow behind the art.
export const GraphicBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${colors.redDeep} 0%, ${colors.wine} 55%, ${colors.wineDark} 100%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.045) 0 70px, rgba(255,255,255,0) 70px 190px)",
          transform: `translateX(${-200 + ((frame * 3) % 380)}px) scale(1.4)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 540 - 520,
          top: 620 - 520,
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,90,80,0.35) 0%, rgba(255,90,80,0) 65%)",
          transform: `scale(${1 + Math.sin(frame / 12) * 0.04})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
  >
    {children}
  </svg>
);

const Banknote: React.FC<{ y: number; rotate: number; opacity: number }> = ({
  y,
  rotate,
  opacity,
}) => (
  <g transform={`translate(540 ${y}) rotate(${rotate})`} opacity={opacity}>
    <rect
      x={-150}
      y={-75}
      width={300}
      height={150}
      rx={14}
      fill="#E4EFD8"
      stroke="#7FA567"
      strokeWidth={6}
    />
    <circle cx={0} cy={0} r={46} fill="none" stroke="#7FA567" strokeWidth={6} />
    <text
      x={0}
      y={20}
      textAnchor="middle"
      fontFamily={condensed}
      fontWeight={800}
      fontSize={58}
      fill="#5E8549"
    >
      €
    </text>
    <text
      x={-120}
      y={-36}
      fontFamily={condensed}
      fontWeight={800}
      fontSize={30}
      fill="#5E8549"
    >
      50
    </text>
    <text
      x={92}
      y={60}
      fontFamily={condensed}
      fontWeight={800}
      fontSize={30}
      fill="#5E8549"
    >
      50
    </text>
  </g>
);

export const AtmScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const note1 = interpolate(frame, [10, 26], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const note2 = interpolate(frame, [22, 38], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const stamp = usePop(18, 9);
  const blink = Math.floor(frame / 8) % 2 === 0 ? 1 : 0.55;
  return (
    <Stage>
      <g
        transform={`translate(540 640) scale(${interpolate(enter, [0, 1], [0.7, 1])}) translate(-540 -640)`}
        opacity={Math.min(1, enter * 1.5)}
      >
        {/* banknotes behind the slot */}
        <Banknote
          y={interpolate(note2, [0, 1], [880, 1010])}
          rotate={interpolate(note2, [0, 1], [0, 9])}
          opacity={note2 > 0 ? 1 : 0}
        />
        <Banknote
          y={interpolate(note1, [0, 1], [880, 990])}
          rotate={interpolate(note1, [0, 1], [0, -6])}
          opacity={note1 > 0 ? 1 : 0}
        />
        {/* machine */}
        <rect
          x={290}
          y={300}
          width={500}
          height={600}
          rx={44}
          fill={colors.cream}
        />
        <rect
          x={290}
          y={300}
          width={500}
          height={110}
          rx={44}
          fill={colors.red}
        />
        <rect x={290} y={360} width={500} height={50} fill={colors.red} />
        <text
          x={540}
          y={378}
          textAnchor="middle"
          fontFamily={condensed}
          fontWeight={800}
          fontSize={64}
          letterSpacing={8}
          fill="#fff"
        >
          ATM
        </text>
        <rect x={340} y={445} width={400} height={210} rx={20} fill="#1E2A33" />
        <text
          x={540}
          y={525}
          textAnchor="middle"
          fontFamily={condensed}
          fontWeight={700}
          fontSize={36}
          fill="#9FE3B5"
          opacity={blink}
        >
          COMMISSIONE
        </text>
        <text
          x={540}
          y={605}
          textAnchor="middle"
          fontFamily={condensed}
          fontWeight={800}
          fontSize={72}
          fill="#9FE3B5"
        >
          € 0,00
        </text>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect
            key={i}
            x={395 + (i % 3) * 100}
            y={690 + Math.floor(i / 3) * 40}
            width={86}
            height={30}
            rx={8}
            fill={i === 11 ? colors.red : "#D9D2CB"}
          />
        ))}
        <rect x={360} y={862} width={360} height={22} rx={11} fill="#2A2224" />
      </g>
      {/* GRATIS stamp */}
      <g
        transform={`translate(800 330) rotate(-14) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`}
        opacity={Math.min(1, stamp * 2)}
      >
        <circle r={118} fill={colors.white} />
        <circle r={104} fill="none" stroke={colors.red} strokeWidth={8} />
        <text
          y={-6}
          textAnchor="middle"
          fontFamily={condensed}
          fontWeight={800}
          fontSize={64}
          fill={colors.red}
        >
          GRATIS
        </text>
        <text
          y={44}
          textAnchor="middle"
          fontFamily={condensed}
          fontWeight={700}
          fontSize={28}
          letterSpacing={2}
          fill={colors.red}
        >
          IN TUTTA ITALIA
        </text>
      </g>
    </Stage>
  );
};

const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <g>
    <rect x={-215} y={-430} width={430} height={860} rx={64} fill="#111" />
    <rect
      x={-197}
      y={-412}
      width={394}
      height={824}
      rx={50}
      fill={colors.cream}
    />
    <clipPath id="screen">
      <rect x={-197} y={-412} width={394} height={824} rx={50} />
    </clipPath>
    <g clipPath="url(#screen)">{children}</g>
    <rect x={-60} y={-400} width={120} height={30} rx={15} fill="#111" />
  </g>
);

const ROWS = [
  { label: "Bonifico ricevuto", amount: "+ € 300,00", color: "#2E8B57" },
  { label: "Pagamento POS", amount: "- € 24,90", color: colors.ink },
  { label: "Prelievo ATM", amount: "€ 0 comm.", color: colors.red },
];

export const AppScene: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 14);
  const balance = interpolate(frame, [6, 34], [0, 2450], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const toast = usePop(44, 12);
  const float = Math.sin(frame / 14) * 10;
  return (
    <Stage>
      <g
        transform={`translate(540 ${interpolate(enter, [0, 1], [1100, 640]) + float}) rotate(${interpolate(enter, [0, 1], [12, -4])})`}
      >
        <PhoneFrame>
          <rect x={-197} y={-412} width={394} height={190} fill={colors.red} />
          <text
            x={-160}
            y={-300}
            fontFamily={condensed}
            fontWeight={800}
            fontSize={40}
            fill="#fff"
          >
            Conto Generali
          </text>
          <text
            x={-160}
            y={-258}
            fontFamily={condensed}
            fontWeight={500}
            fontSize={24}
            fill="rgba(255,255,255,0.8)"
          >
            Saldo disponibile
          </text>
          <rect
            x={-170}
            y={-200}
            width={340}
            height={130}
            rx={24}
            fill="#fff"
          />
          <text
            x={0}
            y={-115}
            textAnchor="middle"
            fontFamily={condensed}
            fontWeight={800}
            fontSize={62}
            fill={colors.ink}
          >
            {`€ ${Math.round(balance).toLocaleString("it-IT")},00`}
          </text>
          {ROWS.map((row, i) => {
            const p = interpolate(frame, [18 + i * 7, 30 + i * 7], [0, 1], {
              ...clamp,
              easing: Easing.out(Easing.back(1.4)),
            });
            return (
              <g
                key={row.label}
                transform={`translate(${interpolate(p, [0, 1], [420, 0])} ${-10 + i * 120})`}
                opacity={p}
              >
                <rect
                  x={-170}
                  y={0}
                  width={340}
                  height={100}
                  rx={20}
                  fill="#fff"
                />
                <circle
                  cx={-118}
                  cy={50}
                  r={28}
                  fill={row.color}
                  opacity={0.15}
                />
                <circle cx={-118} cy={50} r={12} fill={row.color} />
                <text
                  x={-78}
                  y={44}
                  fontFamily={condensed}
                  fontWeight={700}
                  fontSize={26}
                  fill={colors.ink}
                >
                  {row.label}
                </text>
                <text
                  x={-78}
                  y={78}
                  fontFamily={condensed}
                  fontWeight={800}
                  fontSize={26}
                  fill={row.color}
                >
                  {row.amount}
                </text>
              </g>
            );
          })}
        </PhoneFrame>
      </g>
      <g
        transform={`translate(540 ${interpolate(toast, [0, 1], [120, 210])}) scale(${interpolate(toast, [0, 1], [0.6, 1])})`}
        opacity={Math.min(1, toast * 2)}
      >
        <rect x={-300} y={-62} width={600} height={124} rx={34} fill="#fff" />
        <circle cx={-232} cy={0} r={36} fill={colors.red} />
        <path
          d="M -250 0 l 12 14 l 26 -30"
          fill="none"
          stroke="#fff"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={-176}
          y={-6}
          fontFamily={condensed}
          fontWeight={800}
          fontSize={34}
          fill={colors.ink}
        >
          Tutto dal tuo smartphone
        </text>
        <text
          x={-176}
          y={34}
          fontFamily={condensed}
          fontWeight={500}
          fontSize={26}
          fill="#6B5F61"
        >
          Home banking e app, 24 ore su 24
        </text>
      </g>
    </Stage>
  );
};

const Card: React.FC<{
  label: string;
  fill: [string, string];
  text: string;
  id: string;
}> = ({ label, fill, text, id }) => (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={fill[0]} />
        <stop offset="1" stopColor={fill[1]} />
      </linearGradient>
    </defs>
    <rect
      x={-290}
      y={-180}
      width={580}
      height={360}
      rx={32}
      fill={`url(#${id})`}
    />
    <rect
      x={-290}
      y={-180}
      width={580}
      height={360}
      rx={32}
      fill="none"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth={3}
    />
    <rect x={-230} y={-70} width={90} height={70} rx={12} fill={colors.gold} />
    <path
      d="M -230 -35 h 90 M -185 -70 v 70"
      stroke="rgba(0,0,0,0.25)"
      strokeWidth={3}
    />
    {[0, 1, 2].map((i) => (
      <path
        key={i}
        d={`M ${-100 + i * 18} -62 a ${30 + i * 18} ${30 + i * 18} 0 0 1 0 54`}
        fill="none"
        stroke={text}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.8}
      />
    ))}
    <text
      x={-230}
      y={-112}
      fontFamily={condensed}
      fontWeight={800}
      fontSize={36}
      letterSpacing={3}
      fill={text}
    >
      CONTO GENERALI
    </text>
    <text
      x={-230}
      y={80}
      fontFamily={condensed}
      fontWeight={700}
      fontSize={40}
      letterSpacing={6}
      fill={text}
    >
      •••• •••• •••• 4821
    </text>
    <text
      x={230}
      y={148}
      textAnchor="end"
      fontFamily={condensed}
      fontWeight={800}
      fontSize={42}
      letterSpacing={2}
      fill={text}
    >
      {label}
    </text>
  </g>
);

export const CardsScene: React.FC<{ prepaidAt: number; creditAt: number }> = ({
  prepaidAt,
  creditAt,
}) => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const prepaid = usePop(prepaidAt, 13);
  const credit = usePop(creditAt, 13);
  const phoneOut = interpolate(
    frame,
    [prepaidAt - 4, prepaidAt + 8],
    [1, 0],
    clamp,
  );
  const paid = usePop(14, 10);
  return (
    <Stage>
      {/* phase 1: contactless payment */}
      <g
        transform={`translate(540 640) scale(${interpolate(enter, [0, 1], [0.6, 1]) * interpolate(phoneOut, [0, 1], [0.6, 1])})`}
        opacity={Math.min(1, enter * 1.5) * phoneOut}
      >
        <g transform="scale(0.72) rotate(-8)">
          <PhoneFrame>
            <rect
              x={-197}
              y={-412}
              width={394}
              height={824}
              fill={colors.cream}
            />
            <g transform={`scale(${paid})`} opacity={Math.min(1, paid * 2)}>
              <circle r={120} fill={colors.red} />
              <path
                d="M -52 0 l 36 40 l 70 -80"
                fill="none"
                stroke="#fff"
                strokeWidth={24}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <text
              y={210}
              textAnchor="middle"
              fontFamily={condensed}
              fontWeight={800}
              fontSize={56}
              fill={colors.ink}
              opacity={Math.min(1, paid * 2)}
            >
              Pagato!
            </text>
          </PhoneFrame>
        </g>
        {[0, 1, 2].map((i) => {
          const pulse = ((frame + i * 8) % 24) / 24;
          return (
            <path
              key={i}
              d={`M ${230 + i * 50} -110 a ${120 + i * 50} ${120 + i * 50} 0 0 1 0 220`}
              fill="none"
              stroke="#fff"
              strokeWidth={14}
              strokeLinecap="round"
              opacity={0.9 * (1 - pulse)}
            />
          );
        })}
      </g>
      {/* phase 2: cards */}
      <g
        transform={`translate(${interpolate(prepaid, [0, 1], [-700, 500])} ${interpolate(prepaid, [0, 1], [500, 560])}) rotate(${interpolate(prepaid, [0, 1], [-40, -9])})`}
      >
        <Card
          id="prepaid"
          label="PREPAGATA"
          fill={["#F4F1EE", "#BDB3AA"]}
          text={colors.ink}
        />
      </g>
      <g
        transform={`translate(${interpolate(credit, [0, 1], [1700, 580])} ${interpolate(credit, [0, 1], [900, 800])}) rotate(${interpolate(credit, [0, 1], [40, 7])})`}
      >
        <Card
          id="credit"
          label="CREDITO"
          fill={[colors.red, colors.wine]}
          text="#fff"
        />
      </g>
    </Stage>
  );
};

export const BankScene: React.FC<{ strikeAt: number }> = ({ strikeAt }) => {
  const frame = useCurrentFrame();
  const enter = usePop(0, 13);
  const strike = interpolate(frame, [strikeAt, strikeAt + 12], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const shake = strike > 0 && strike < 1 ? Math.sin(frame * 2.2) * 8 : 0;
  const circumference = 2 * Math.PI * 300;
  return (
    <Stage>
      <g
        transform={`translate(${540 + shake} 640) scale(${interpolate(enter, [0, 1], [0.6, 1])})`}
        opacity={Math.min(1, enter * 1.5)}
      >
        <path d="M -270 -140 L 0 -280 L 270 -140 Z" fill={colors.cream} />
        <rect x={-260} y={-130} width={520} height={56} fill={colors.cream} />
        <text
          y={-88}
          textAnchor="middle"
          fontFamily={condensed}
          fontWeight={800}
          fontSize={44}
          letterSpacing={10}
          fill={colors.wine}
        >
          BANCA
        </text>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={-215 + i * 125}
            y={-60}
            width={56}
            height={250}
            rx={8}
            fill={colors.cream}
          />
        ))}
        <rect
          x={-280}
          y={200}
          width={560}
          height={36}
          rx={6}
          fill={colors.cream}
        />
        <rect
          x={-310}
          y={244}
          width={620}
          height={36}
          rx={6}
          fill={colors.cream}
        />
        {/* "no" sign */}
        <circle
          r={300}
          fill="none"
          stroke={colors.red}
          strokeWidth={46}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - strike)}
          transform="rotate(-90)"
        />
        <line
          x1={-212}
          y1={-212}
          x2={-212 + 424 * strike}
          y2={-212 + 424 * strike}
          stroke={colors.red}
          strokeWidth={46}
          strokeLinecap="round"
          opacity={strike > 0 ? 1 : 0}
        />
      </g>
    </Stage>
  );
};

export const Pin: React.FC<{ size: number; color?: string }> = ({
  size,
  color = colors.red,
}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 100 130">
    <path
      d="M50 126 C 50 126 8 74 8 46 A 42 42 0 0 1 92 46 C 92 74 50 126 50 126 Z"
      fill={color}
      stroke="#fff"
      strokeWidth={6}
    />
    <circle cx={50} cy={46} r={16} fill="#fff" />
  </svg>
);
