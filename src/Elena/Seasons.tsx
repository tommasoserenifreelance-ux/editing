// Illustrated "4 stagioni" panorama behind Elena's walk: spring (slides 1-2),
// summer (3), autumn (4-5), winter (6), one continuous landscape with the
// ground line where she walks. The top stays pale so the black text reads.

const W = 6480;
const H = 1350;
const GROUND = 1150; // top of the walking ground

// Deterministic pseudo-random, so the illustration is identical every frame.
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const BlossomTree: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} ${GROUND + 10}) scale(${s})`}>
    <path d="M-14 0 L-8 -260 L8 -260 L14 0 Z" fill="#9C7A63" />
    <path d="M0 -200 L-70 -300" stroke="#9C7A63" strokeWidth={12} />
    <path d="M0 -230 L80 -320" stroke="#9C7A63" strokeWidth={12} />
    {Array.from({ length: 14 }, (_, i) => (
      <circle
        key={i}
        cx={(rnd(x + i) - 0.5) * 260}
        cy={-300 - rnd(x + i * 7) * 170}
        r={55 + rnd(x + i * 3) * 30}
        fill={i % 3 ? "#F6C9D8" : "#F3B4C9"}
        opacity={0.95}
      />
    ))}
  </g>
);

const RoundTree: React.FC<{ x: number; color: string; s?: number }> = ({
  x,
  color,
  s = 1,
}) => (
  <g transform={`translate(${x} ${GROUND + 10}) scale(${s})`}>
    <path d="M-14 0 L-9 -240 L9 -240 L14 0 Z" fill="#8B5E3C" />
    {Array.from({ length: 10 }, (_, i) => (
      <circle
        key={i}
        cx={(rnd(x + i) - 0.5) * 220}
        cy={-280 - rnd(x + i * 5) * 150}
        r={60 + rnd(x + i * 2) * 30}
        fill={color}
        opacity={0.92 - (i % 3) * 0.08}
      />
    ))}
  </g>
);

const Pine: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} ${GROUND + 10}) scale(${s})`}>
    <rect x={-12} y={-60} width={24} height={60} fill="#7C6A5C" />
    {[0, 1, 2].map((k) => (
      <g key={k}>
        <path
          d={`M0 ${-430 + k * 110} L${-110 - k * 30} ${-200 + k * 90} L${110 + k * 30} ${-200 + k * 90} Z`}
          fill="#8FB3A3"
        />
        <path
          d={`M0 ${-430 + k * 110} L${-55 - k * 15} ${-315 + k * 100} L${55 + k * 15} ${-315 + k * 100} Z`}
          fill="#FFFFFF"
        />
      </g>
    ))}
  </g>
);

const Pumpkin: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <g transform={`translate(${x} ${GROUND + 70}) scale(${s})`}>
    <ellipse cx={-28} cy={0} rx={34} ry={40} fill="#E8853D" />
    <ellipse cx={28} cy={0} rx={34} ry={40} fill="#E8853D" />
    <ellipse cx={0} cy={0} rx={36} ry={44} fill="#F0974B" />
    <rect x={-5} y={-58} width={10} height={20} rx={4} fill="#6E8B4E" />
  </g>
);

const Flower: React.FC<{ x: number; y: number; c: string }> = ({ x, y, c }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 L0 40" stroke="#7FA86A" strokeWidth={4} />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle
        key={a}
        cx={Math.cos((a * Math.PI) / 180) * 11}
        cy={Math.sin((a * Math.PI) / 180) * 11}
        r={9}
        fill={c}
      />
    ))}
    <circle r={6} fill="#F7D774" />
  </g>
);

export const Seasons: React.FC = () => (
  <svg
    width={W}
    height={H}
    viewBox={`0 0 ${W} ${H}`}
    style={{ position: "absolute", left: 0, top: 0 }}
  >
    <defs>
      <linearGradient id="sky" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#FBE3EC" />
        <stop offset="0.28" stopColor="#FCEBEF" />
        <stop offset="0.36" stopColor="#FFF0C8" />
        <stop offset="0.48" stopColor="#FFE9BD" />
        <stop offset="0.56" stopColor="#FADCC2" />
        <stop offset="0.8" stopColor="#F6D3BC" />
        <stop offset="0.88" stopColor="#E3ECF4" />
        <stop offset="1" stopColor="#E8EFF6" />
      </linearGradient>
      <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.75} />
        <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.15} />
        <stop offset="0.7" stopColor="#FFFFFF" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="hillBack" x1="0" x2="1">
        <stop offset="0" stopColor="#DDEBCB" />
        <stop offset="0.3" stopColor="#E2EDC9" />
        <stop offset="0.38" stopColor="#EFE2AE" />
        <stop offset="0.5" stopColor="#EBD9A2" />
        <stop offset="0.58" stopColor="#EBC8A0" />
        <stop offset="0.8" stopColor="#E6BC94" />
        <stop offset="0.88" stopColor="#F1F4F8" />
        <stop offset="1" stopColor="#F4F7FA" />
      </linearGradient>
      <linearGradient id="hillFront" x1="0" x2="1">
        <stop offset="0" stopColor="#C8E0AE" />
        <stop offset="0.3" stopColor="#CDE3AF" />
        <stop offset="0.38" stopColor="#E6CF8C" />
        <stop offset="0.5" stopColor="#E2C680" />
        <stop offset="0.58" stopColor="#DFAE7B" />
        <stop offset="0.8" stopColor="#DAA170" />
        <stop offset="0.88" stopColor="#E9EEF3" />
        <stop offset="1" stopColor="#EEF2F6" />
      </linearGradient>
      <linearGradient id="ground" x1="0" x2="1">
        <stop offset="0" stopColor="#B9D79E" />
        <stop offset="0.3" stopColor="#BFDAA0" />
        <stop offset="0.38" stopColor="#E0C783" />
        <stop offset="0.5" stopColor="#DDBE79" />
        <stop offset="0.58" stopColor="#D49A68" />
        <stop offset="0.8" stopColor="#CF9161" />
        <stop offset="0.88" stopColor="#F5F7FA" />
        <stop offset="1" stopColor="#FAFBFC" />
      </linearGradient>
      <linearGradient id="sea" x1="0" x2="1">
        <stop offset="0" stopColor="#9FD3E0" stopOpacity={0} />
        <stop offset="0.15" stopColor="#9FD3E0" />
        <stop offset="0.85" stopColor="#9FD3E0" />
        <stop offset="1" stopColor="#9FD3E0" stopOpacity={0} />
      </linearGradient>
    </defs>

    {/* Sky */}
    <rect width={W} height={H} fill="url(#sky)" />

    {/* Summer sun and sea */}
    <circle cx={3060} cy={620} r={150} fill="#FFD27A" opacity={0.9} />
    <circle cx={3060} cy={620} r={230} fill="#FFD27A" opacity={0.25} />
    <rect x={2150} y={930} width={1150} height={70} fill="url(#sea)" />
    <path d="M2560 920 L2600 840 L2600 920 Z" fill="#FFFFFF" />
    <path d="M2540 922 L2640 922 L2625 935 L2555 935 Z" fill="#C98F6B" />

    {/* Back hills */}
    <path
      d={`M0 980 C 600 900, 1100 1010, 1700 950 S 2900 1000, 3500 940 S 4700 1010, 5300 950 S 6100 990, ${W} 960 L ${W} ${H} L 0 ${H} Z`}
      fill="url(#hillBack)"
    />
    {/* Front hills */}
    <path
      d={`M0 1070 C 500 1020, 1000 1100, 1600 1050 S 2700 1090, 3300 1040 S 4500 1100, 5100 1045 S 6000 1080, ${W} 1060 L ${W} ${H} L 0 ${H} Z`}
      fill="url(#hillFront)"
    />

    {/* Spring */}
    <BlossomTree x={260} s={1.05} />
    <BlossomTree x={1560} s={0.9} />
    <BlossomTree x={1980} s={0.75} />
    {/* Autumn */}
    <RoundTree x={3500} color="#E9A35C" s={0.95} />
    <RoundTree x={3980} color="#D9773F" s={0.8} />
    <RoundTree x={4720} color="#E8B04F" s={1.0} />
    <RoundTree x={5220} color="#C9653A" s={0.85} />
    {/* Winter */}
    <Pine x={5560} s={0.95} />
    <Pine x={5900} s={0.75} />
    <Pine x={6330} s={1.0} />

    {/* Ground */}
    <rect x={0} y={GROUND} width={W} height={H - GROUND} fill="url(#ground)" />

    {/* Spring flowers on the ground */}
    {Array.from({ length: 46 }, (_, i) => (
      <Flower
        key={`f${i}`}
        x={30 + rnd(i) * 2200}
        y={GROUND + 25 + rnd(i * 9) * 140}
        c={["#F3B4C9", "#FFFFFF", "#D9C4F1", "#F7D774"][i % 4]}
      />
    ))}
    {/* Summer wheat */}
    {Array.from({ length: 40 }, (_, i) => {
      const x = 2250 + rnd(i + 99) * 950;
      const y = GROUND + 40 + rnd(i * 13 + 5) * 120;
      return (
        <g key={`w${i}`}>
          <path
            d={`M${x} ${y + 40} L${x + 6} ${y - 30}`}
            stroke="#C9A24F"
            strokeWidth={4}
          />
          <ellipse cx={x + 7} cy={y - 40} rx={7} ry={18} fill="#D8B45E" />
        </g>
      );
    })}
    {/* Autumn pumpkins and leaves */}
    <Pumpkin x={3720} s={1.1} />
    <Pumpkin x={4350} s={0.9} />
    <Pumpkin x={4980} s={1.2} />
    {Array.from({ length: 60 }, (_, i) => (
      <ellipse
        key={`l${i}`}
        cx={3300 + rnd(i + 300) * 2100}
        cy={GROUND + 15 + rnd(i * 17 + 3) * 170}
        rx={14}
        ry={7}
        transform={`rotate(${rnd(i) * 180} ${3300 + rnd(i + 300) * 2100} ${GROUND + 15 + rnd(i * 17 + 3) * 170})`}
        fill={["#D9773F", "#E9A35C", "#C9653A", "#E8B04F"][i % 4]}
      />
    ))}
    {/* Winter snow on the ground and in the air */}
    {Array.from({ length: 70 }, (_, i) => (
      <circle
        key={`s${i}`}
        cx={5450 + rnd(i + 700) * 1030}
        cy={620 + rnd(i * 23 + 11) * 520}
        r={4 + rnd(i * 3) * 6}
        fill="#FFFFFF"
        opacity={0.9}
      />
    ))}

    {/* Pale top so the black text stays readable */}
    <rect width={W} height={H} fill="url(#fade)" />
  </svg>
);
