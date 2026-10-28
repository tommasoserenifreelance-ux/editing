import React, { useId } from "react";

/*
 * Flat screen-print illustrations (reference: coral / mint / ink palette,
 * worn grainy fill, rough edges, white sticker outline). Each icon is drawn
 * in a 200x200 box; <Illo> adds the print texture.
 */
const C = "#EF5B6E"; // coral
const CD = "#C2394F";
const M = "#4CCFA2"; // mint
const MD = "#22A47B";
const K = "#1E1A24"; // ink
const W = "#FFFFFF";
const Y = "#F7C600"; // LongevaMed yellow
const S = "#F4A98A"; // skin
const SD = "#D9806A";

const ink = { stroke: K, strokeWidth: 5, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const hatch = { stroke: K, strokeWidth: 3.5, strokeLinecap: "round", fill: "none" } as const;

const Biceps = () => (
  <g>
    <path d="M18 128 L58 110 L70 156 L28 172 Z" fill={M} {...ink} />
    <path d="M24 140 L62 125 M30 156 L66 142" {...hatch} stroke={MD} />
    <path
      d="M58 110 C70 72 120 58 146 96 L160 150 C128 168 92 166 70 156 Z"
      fill={S}
      {...ink}
    />
    <path d="M78 104 C88 74 118 70 132 94" fill="none" {...ink} />
    <path d="M90 140 L104 128 M104 146 L120 132 M120 150 L134 138" {...hatch} stroke={SD} />
    <path d="M146 96 C146 78 144 64 146 52 L178 56 C176 82 176 120 160 150 Z" fill={S} {...ink} />
    <path d="M140 52 C138 28 160 18 178 24 C192 30 192 52 180 60 L146 60 Z" fill={S} {...ink} />
    <path d="M150 34 L176 36 M150 46 L178 48" {...hatch} />
  </g>
);

const BoneIco = () => (
  <g transform="rotate(-32 100 100)">
    <path
      d="M48 86 C30 70 38 52 52 54 C56 40 76 42 74 58 L76 86 L124 86 L126 58 C124 42 144 40 148 54 C162 52 170 70 152 86 L152 114 C170 130 162 148 148 146 C144 160 124 158 126 142 L124 114 L76 114 L74 142 C76 158 56 160 52 146 C38 148 30 130 48 114 Z"
      fill="#FFF3E2"
      {...ink}
    />
    <path d="M84 104 L118 104 M60 64 L66 74 M136 130 L142 140" {...hatch} stroke="#C9B49A" />
  </g>
);

const Drop = () => (
  <g>
    <path d="M100 18 C130 64 160 96 160 128 C160 162 134 184 100 184 C66 184 40 162 40 128 C40 96 70 64 100 18 Z" fill={C} {...ink} />
    <path d="M100 30 C126 70 150 100 150 128 C150 158 128 176 100 178 C124 160 132 130 100 30 Z" fill={CD} />
    <path d="M66 128 C66 108 76 94 86 82" fill="none" stroke={W} strokeWidth={9} strokeLinecap="round" />
  </g>
);

const HeartFire = () => (
  <g>
    <path d="M100 176 C40 132 22 104 30 74 C26 50 40 30 52 22 C52 42 62 50 70 52 C70 30 88 14 104 8 C98 28 112 40 122 46 C126 34 136 26 148 22 C146 38 156 48 166 56 C180 76 174 112 100 176 Z" fill={M} {...ink} />
    <path d="M100 172 C52 136 38 112 42 92 C46 70 72 62 100 90 C128 62 154 70 158 92 C162 112 148 136 100 172 Z" fill={C} {...ink} />
    <path d="M60 96 C62 84 72 80 80 82" fill="none" stroke={W} strokeWidth={8} strokeLinecap="round" />
    <path d="M118 140 L134 124 M106 152 L128 130" {...hatch} stroke={CD} />
  </g>
);

const BrainIco = () => (
  <g>
    <path d="M100 38 C84 22 54 28 52 52 C30 54 22 80 34 96 C20 112 30 140 52 140 C56 162 84 170 100 154 C116 170 144 162 148 140 C170 140 180 112 166 96 C178 80 170 54 148 52 C146 28 116 22 100 38 Z" fill={C} {...ink} />
    <path d="M100 40 L100 152" {...hatch} />
    <path d="M60 70 C72 66 78 76 74 86 M44 104 C58 98 68 108 64 120 M80 128 C76 140 86 146 90 140 M140 70 C128 66 122 76 126 86 M156 104 C142 98 132 108 136 120 M120 128 C124 140 114 146 110 140" {...hatch} />
    <path d="M66 52 C74 46 84 46 90 50" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Person: React.FC<{ shirt: string; hair: "short" | "long" }> = ({ shirt, hair }) => (
  <g>
    {hair === "long" ? <path d="M58 96 C50 40 76 22 100 22 C124 22 150 40 142 96 Z" fill={K} /> : null}
    <path d="M30 186 C30 140 60 122 100 122 C140 122 170 140 170 186 Z" fill={shirt} {...ink} />
    <path d="M84 112 L84 132 C92 140 108 140 116 132 L116 112 Z" fill={S} {...ink} />
    <ellipse cx="100" cy="76" rx="36" ry="42" fill={S} {...ink} />
    {hair === "short" ? (
      <path d="M62 70 C60 38 84 28 104 30 C128 30 142 46 138 70 C126 56 104 54 86 50 C80 58 70 64 62 70 Z" fill={K} />
    ) : (
      <path d="M64 70 C66 44 84 34 100 34 C120 34 134 46 136 70 C120 58 96 52 80 48 C76 58 70 64 64 70 Z" fill={K} />
    )}
    <path d="M86 84 L86 86 M114 84 L114 86" stroke={K} strokeWidth={7} strokeLinecap="round" />
    <path d="M90 100 C96 106 104 106 110 100" fill="none" {...ink} strokeWidth={4} />
    <path d="M56 160 L72 146 M128 160 L144 146" {...hatch} />
  </g>
);

const Bolt = () => (
  <g>
    <path d="M116 10 L40 112 L92 112 L74 190 L162 76 L108 76 Z" fill={Y} {...ink} />
    <path d="M108 30 L62 100" fill="none" stroke={W} strokeWidth={8} strokeLinecap="round" />
    <path d="M110 120 L96 160 M128 104 L112 132" {...hatch} stroke="#B58F00" />
  </g>
);

const Smile = () => (
  <g>
    <circle cx="100" cy="100" r="78" fill={M} {...ink} />
    <path d="M100 178 C150 170 176 130 170 92 C160 140 130 166 100 178 Z" fill={MD} />
    <path d="M68 86 C72 76 82 76 86 86 M114 86 C118 76 128 76 132 86" fill="none" {...ink} strokeWidth={6} />
    <path d="M62 112 C74 146 126 146 138 112 Z" fill={K} />
    <path d="M78 132 C90 140 110 140 122 132" fill="none" stroke={C} strokeWidth={8} strokeLinecap="round" />
    <circle cx="56" cy="110" r="10" fill={C} />
    <circle cx="144" cy="110" r="10" fill={C} />
    <path d="M52 64 C58 48 72 38 86 34" fill="none" stroke={W} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const ScaleIco = () => (
  <g>
    <rect x="26" y="40" width="148" height="138" rx="28" fill={M} {...ink} />
    <path d="M44 160 L70 136 M60 166 L88 140" {...hatch} stroke={MD} />
    <path d="M58 92 A42 42 0 0 1 142 92 Z" fill={W} {...ink} />
    <path d="M70 82 L74 86 M100 60 L100 66 M130 82 L126 86" {...hatch} />
    <path d="M100 92 L128 64" stroke={C} strokeWidth={7} strokeLinecap="round" />
    <circle cx="100" cy="92" r="7" fill={K} />
    <rect x="60" y="112" width="34" height="46" rx="12" fill={W} opacity={0.85} />
    <rect x="106" y="112" width="34" height="46" rx="12" fill={W} opacity={0.85} />
  </g>
);

const Burger = () => (
  <g>
    <path d="M30 96 C30 46 170 46 170 96 Z" fill={Y} {...ink} />
    <path d="M62 66 L68 70 M96 58 L100 62 M130 66 L136 70 M80 80 L84 84 M116 80 L120 84" stroke={W} strokeWidth={5} strokeLinecap="round" />
    <path d="M24 106 C40 94 50 116 66 104 C82 92 92 116 108 104 C124 92 134 116 150 104 C162 96 170 102 176 106 L176 116 L24 116 Z" fill={M} {...ink} />
    <rect x="28" y="116" width="144" height="24" rx="10" fill={K} />
    <path d="M40 124 L52 124 M70 130 L84 130 M110 124 L124 124 M146 130 L158 130" stroke="#5A4A5E" strokeWidth={4} strokeLinecap="round" />
    <rect x="34" y="140" width="132" height="12" rx="6" fill={C} {...ink} strokeWidth={4} />
    <path d="M32 152 L168 152 C168 172 150 180 100 180 C50 180 32 172 32 152 Z" fill={Y} {...ink} />
  </g>
);

const Moon = () => (
  <g>
    <path d="M118 22 C70 26 40 66 44 110 C48 156 92 186 138 178 C104 166 82 136 84 100 C86 64 104 38 118 22 Z" fill={Y} {...ink} />
    <path d="M70 120 L82 108 M68 142 L84 128 M80 160 L96 146" {...hatch} stroke="#B58F00" />
    <path d="M118 52 H150 L118 88 H150" fill="none" {...ink} strokeWidth={7} />
    <path d="M150 112 H172 L150 136 H172" fill="none" stroke={C} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Couch = () => (
  <g>
    <rect x="40" y="56" width="120" height="66" rx="18" fill={C} {...ink} />
    <rect x="16" y="90" width="40" height="72" rx="16" fill={C} {...ink} />
    <rect x="144" y="90" width="40" height="72" rx="16" fill={C} {...ink} />
    <rect x="52" y="112" width="96" height="46" rx="10" fill={M} {...ink} />
    <path d="M100 116 L100 154" {...hatch} />
    <path d="M58 72 L76 90 M120 72 L138 90" {...hatch} stroke={CD} />
    <path d="M30 162 L28 180 M170 162 L172 180" {...ink} strokeWidth={8} />
  </g>
);

const Storm = () => (
  <g>
    <path d="M44 120 C20 120 18 84 44 80 C46 50 80 40 98 58 C108 34 150 36 154 68 C180 68 186 116 156 120 Z" fill={K} {...ink} />
    <path d="M60 70 C66 60 78 56 88 60" fill="none" stroke="#5A4A5E" strokeWidth={7} strokeLinecap="round" />
    <path d="M104 104 L80 150 L104 150 L92 190 L134 136 L110 136 L122 104 Z" fill={Y} {...ink} />
    <path d="M56 136 L48 156 M150 136 L142 156" stroke={M} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const ChartDown = () => (
  <g>
    <rect x="18" y="18" width="164" height="164" rx="26" fill={M} {...ink} />
    <path d="M40 60 L84 92 L70 108 L126 140" fill="none" stroke={W} strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
    <path d="M114 150 L150 154 L140 120 Z" fill={W} />
    <path d="M34 166 L54 146 M54 172 L72 154" {...hatch} stroke={MD} />
  </g>
);

const Pill = () => (
  <g transform="rotate(-35 100 100)">
    <path d="M60 64 L100 64 L100 136 L60 136 C40 136 24 120 24 100 C24 80 40 64 60 64 Z" fill={C} {...ink} />
    <path d="M100 64 L140 64 C160 64 176 80 176 100 C176 120 160 136 140 136 L100 136 Z" fill={W} {...ink} />
    <path d="M44 84 C50 78 58 76 66 76" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" />
    <path d="M118 118 L132 104 M134 122 L150 106" {...hatch} stroke="#C9C2CC" />
  </g>
);


/* ---- NAD episode ---- */

const Cell = () => (
  <g>
    <circle cx="100" cy="100" r="84" fill={M} {...ink} />
    <circle cx="100" cy="100" r="70" fill="#7EDDBC" />
    <ellipse cx="112" cy="92" rx="30" ry="26" fill={C} {...ink} />
    <circle cx="120" cy="86" r="8" fill={CD} />
    <path d="M52 132 C60 124 70 126 74 134 M58 70 C66 66 72 70 74 76 M126 140 C134 132 146 134 148 142" {...hatch} stroke={MD} />
    <ellipse cx="66" cy="104" rx="10" ry="6" fill={Y} {...ink} strokeWidth={4} />
    <ellipse cx="96" cy="146" rx="9" ry="5" fill={Y} {...ink} strokeWidth={4} />
    <path d="M44 72 C52 56 64 46 78 40" fill="none" stroke={W} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const Dna = () => (
  <g transform="rotate(-28 100 100)">
    <path d="M121.6 27 L78.4 27 M142.5 44 L57.5 44 M144.0 61 L56.0 61 M125.2 78 L74.8 78 M94.9 95 L105.1 95 M66.9 112 L133.1 112 M54.1 129 L145.9 129 M62.4 146 L137.6 146 M87.9 163 L112.1 163 M119.0 180 L81.0 180" stroke={K} strokeWidth={6} strokeLinecap="round" />
    <path d="M100.0 15.0 L90.7 20.0 L81.8 25.0 L73.7 30.0 L66.6 35.0 L60.9 40.0 L56.8 45.0 L54.5 50.0 L54.1 55.0 L55.5 60.0 L58.8 65.0 L63.8 70.0 L70.3 75.0 L78.0 80.0 L86.6 85.0 L95.8 90.0 L105.1 95.0 L114.2 100.0 L122.8 105.0 L130.4 110.0 L136.7 115.0 L141.5 120.0 L144.7 125.0 L146.0 130.0 L145.4 135.0 L142.9 140.0 L138.7 145.0 L132.8 150.0 L125.6 155.0 L117.4 160.0 L108.5 165.0 L99.1 170.0 L89.9 175.0 L81.0 180.0 L73.0 185.0" fill="none" stroke={K} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M100.0 15.0 L90.7 20.0 L81.8 25.0 L73.7 30.0 L66.6 35.0 L60.9 40.0 L56.8 45.0 L54.5 50.0 L54.1 55.0 L55.5 60.0 L58.8 65.0 L63.8 70.0 L70.3 75.0 L78.0 80.0 L86.6 85.0 L95.8 90.0 L105.1 95.0 L114.2 100.0 L122.8 105.0 L130.4 110.0 L136.7 115.0 L141.5 120.0 L144.7 125.0 L146.0 130.0 L145.4 135.0 L142.9 140.0 L138.7 145.0 L132.8 150.0 L125.6 155.0 L117.4 160.0 L108.5 165.0 L99.1 170.0 L89.9 175.0 L81.0 180.0 L73.0 185.0" fill="none" stroke={M} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M100.0 15.0 L109.3 20.0 L118.2 25.0 L126.3 30.0 L133.4 35.0 L139.1 40.0 L143.2 45.0 L145.5 50.0 L145.9 55.0 L144.5 60.0 L141.2 65.0 L136.2 70.0 L129.7 75.0 L122.0 80.0 L113.4 85.0 L104.2 90.0 L94.9 95.0 L85.8 100.0 L77.2 105.0 L69.6 110.0 L63.3 115.0 L58.5 120.0 L55.3 125.0 L54.0 130.0 L54.6 135.0 L57.1 140.0 L61.3 145.0 L67.2 150.0 L74.4 155.0 L82.6 160.0 L91.5 165.0 L100.9 170.0 L110.1 175.0 L119.0 180.0 L127.0 185.0" fill="none" stroke={K} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M100.0 15.0 L109.3 20.0 L118.2 25.0 L126.3 30.0 L133.4 35.0 L139.1 40.0 L143.2 45.0 L145.5 50.0 L145.9 55.0 L144.5 60.0 L141.2 65.0 L136.2 70.0 L129.7 75.0 L122.0 80.0 L113.4 85.0 L104.2 90.0 L94.9 95.0 L85.8 100.0 L77.2 105.0 L69.6 110.0 L63.3 115.0 L58.5 120.0 L55.3 125.0 L54.0 130.0 L54.6 135.0 L57.1 140.0 L61.3 145.0 L67.2 150.0 L74.4 155.0 L82.6 160.0 L91.5 165.0 L100.9 170.0 L110.1 175.0 L119.0 180.0 L127.0 185.0" fill="none" stroke={C} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

const Flebo = () => (
  <g>
    <path d="M100 4 L100 22" {...ink} strokeWidth={6} />
    <path d="M64 22 L136 22 L132 104 C132 120 120 128 100 128 C80 128 68 120 68 104 Z" fill={W} {...ink} />
    <path d="M70 62 L130 62 L132 104 C132 120 120 128 100 128 C80 128 68 120 68 104 Z" fill={Y} {...ink} />
    <path d="M78 36 L104 36 M78 48 L96 48" stroke={K} strokeWidth={4} strokeLinecap="round" />
    <rect x="92" y="128" width="16" height="16" fill={C} {...ink} strokeWidth={4} />
    <path d="M100 144 C100 170 140 160 150 190" fill="none" stroke={K} strokeWidth={5} strokeLinecap="round" />
    <path d="M84 78 C86 92 88 104 96 112" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Tablet = () => (
  <g>
    <ellipse cx="100" cy="116" rx="72" ry="44" fill="#E9E4EC" {...ink} />
    <ellipse cx="100" cy="100" rx="72" ry="44" fill={W} {...ink} />
    <path d="M48 100 L152 100" {...hatch} strokeWidth={5} />
    <path d="M62 82 C70 74 84 70 96 70" fill="none" stroke="#C9C2CC" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const Compressa = () => (
  <g transform="rotate(-20 100 100)">
    <rect x="22" y="66" width="156" height="72" rx="36" fill={M} {...ink} />
    <path d="M100 70 L100 134" {...hatch} />
    <path d="M44 88 C54 80 66 78 78 78" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" />
    <path d="M120 120 L134 106 M138 124 L152 110" {...hatch} stroke={MD} />
  </g>
);

const Brick: React.FC<{ fill: string; shade: string }> = ({ fill, shade }) => (
  <g>
    <path d="M30 76 L130 76 L170 56 L70 56 Z" fill={shade} {...ink} />
    <path d="M130 76 L170 56 L170 124 L130 144 Z" fill={shade} {...ink} />
    <rect x="30" y="76" width="100" height="68" fill={fill} {...ink} />
    <path d="M44 128 L60 112 M58 136 L76 118" {...hatch} />
  </g>
);

const Microscope = () => (
  <g>
    <rect x="36" y="166" width="128" height="18" rx="6" fill={K} />
    <path d="M70 166 C70 130 96 110 128 112" fill="none" stroke={K} strokeWidth={14} strokeLinecap="round" />
    <rect x="86" y="18" width="34" height="96" rx="8" transform="rotate(-28 103 66)" fill={C} {...ink} />
    <rect x="70" y="118" width="76" height="12" rx="4" fill={M} {...ink} strokeWidth={4} />
    <rect x="60" y="6" width="34" height="22" rx="5" transform="rotate(-28 77 17)" fill={K} />
    <path d="M100 40 L112 62" stroke={W} strokeWidth={6} strokeLinecap="round" />
  </g>
);

const Sparkle = () => (
  <g>
    <path d="M96 10 C104 64 120 82 176 92 C120 102 104 120 96 184 C88 120 72 102 18 92 C72 82 88 64 96 10 Z" fill={Y} {...ink} />
    <path d="M160 24 C162 38 166 42 180 44 C166 46 162 50 160 64 C158 50 154 46 140 44 C154 42 158 38 160 24 Z" fill={M} {...ink} strokeWidth={4} />
    <path d="M86 56 C84 70 80 78 72 84" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Study = () => (
  <g>
    <rect x="40" y="24" width="112" height="150" rx="10" fill={W} {...ink} transform="rotate(6 96 99)" />
    <rect x="34" y="20" width="112" height="150" rx="10" fill={W} {...ink} />
    <rect x="50" y="38" width="80" height="14" rx="4" fill={C} />
    <path d="M50 70 H130 M50 86 H130 M50 102 H112" stroke={K} strokeWidth={5} strokeLinecap="round" />
    <path d="M52 152 L68 134 L84 144 L104 118 L128 128" fill="none" stroke={M} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="146" cy="150" r="26" fill={Y} {...ink} />
    <path d="M164 168 L186 190" {...ink} strokeWidth={10} />
  </g>
);

const Check = () => (
  <g>
    <circle cx="100" cy="100" r="80" fill={M} {...ink} />
    <path d="M58 102 L88 132 L144 72" fill="none" stroke={W} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M150 148 L136 134 M132 162 L118 148" {...hatch} stroke={MD} />
  </g>
);

const Molecule = () => (
  <g>
    <path d="M100 100 L48 56 M100 100 L158 70 M100 100 L84 164 M158 70 L176 132" stroke={K} strokeWidth={9} strokeLinecap="round" />
    <circle cx="100" cy="100" r="32" fill={C} {...ink} />
    <circle cx="48" cy="56" r="22" fill={M} {...ink} />
    <circle cx="158" cy="70" r="24" fill={Y} {...ink} />
    <circle cx="84" cy="164" r="20" fill={M} {...ink} />
    <circle cx="176" cy="132" r="14" fill={W} {...ink} />
    <path d="M86 86 C90 80 96 78 102 78" fill="none" stroke={W} strokeWidth={6} strokeLinecap="round" />
  </g>
);

const Hourglass = () => (
  <g>
    <rect x="44" y="14" width="112" height="18" rx="6" fill={C} {...ink} />
    <rect x="44" y="168" width="112" height="18" rx="6" fill={C} {...ink} />
    <path d="M58 32 L142 32 C142 70 112 86 108 100 C112 114 142 130 142 168 L58 168 C58 130 88 114 92 100 C88 86 58 70 58 32 Z" fill="#EAF7F2" {...ink} />
    <path d="M72 52 L128 52 C122 70 108 80 100 88 C92 80 78 70 72 52 Z" fill={Y} />
    <path d="M66 164 C72 140 90 132 100 128 C110 132 128 140 134 164 Z" fill={Y} />
    <path d="M100 96 L100 128" stroke={Y} strokeWidth={4} />
  </g>
);

const Attention = () => (
  <g>
    <path d="M100 14 L190 176 L10 176 Z" fill={Y} {...ink} strokeLinejoin="round" />
    <rect x="90" y="66" width="20" height="62" rx="8" fill={K} />
    <circle cx="100" cy="150" r="11" fill={K} />
    <path d="M86 40 L58 92" stroke={W} strokeWidth={7} strokeLinecap="round" />
  </g>
);

/* ---- YouTube call-to-action ---- */

const Bell = () => (
  <g>
    <path d="M100 22 C66 22 50 50 50 82 L50 118 L32 146 L168 146 L150 118 L150 82 C150 50 134 22 100 22 Z" fill={Y} {...ink} />
    <circle cx="100" cy="18" r="10" fill={Y} {...ink} />
    <path d="M78 150 C78 174 122 174 122 150 Z" fill={Y} {...ink} />
    <path d="M70 70 C72 56 80 46 90 42" fill="none" stroke={W} strokeWidth={8} strokeLinecap="round" />
    <path d="M18 60 C10 74 10 92 16 104 M182 60 C190 74 190 92 184 104" fill="none" stroke={K} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const ThumbUp = () => (
  <g>
    <rect x="18" y="86" width="40" height="92" rx="8" fill={C} {...ink} />
    <path d="M58 92 L90 30 C96 18 118 22 116 40 L110 78 L162 78 C178 78 186 92 182 106 L168 160 C164 172 154 178 142 178 L58 178 Z" fill={W} {...ink} />
    <path d="M118 106 L168 106 M114 132 L160 132" {...hatch} />
    <path d="M90 50 C94 42 100 36 106 34" fill="none" stroke="#C9C2CC" strokeWidth={6} strokeLinecap="round" />
  </g>
);

const Cursor = () => (
  <g>
    <path d="M40 16 L40 160 L76 126 L102 184 L128 172 L102 116 L150 116 Z" fill={W} {...ink} strokeWidth={7} />
  </g>
);

/* ---- Estrogens episode ---- */

const Shield = () => (
  <g>
    <path d="M100 10 L172 38 C172 110 146 158 100 190 C54 158 28 110 28 38 Z" fill={M} {...ink} />
    <path d="M100 26 L158 48 C156 108 136 146 100 172 Z" fill={MD} />
    <path d="M100 64 C100 64 92 52 80 54 C66 56 62 72 70 84 L100 116 L130 84 C138 72 134 56 120 54 C108 52 100 64 100 64 Z" fill={C} {...ink} strokeWidth={4} />
    <path d="M52 52 C54 90 64 120 84 146" fill="none" stroke={W} strokeWidth={8} strokeLinecap="round" />
  </g>
);

const HeartPulse = () => (
  <g>
    <path d="M100 176 C40 132 18 104 22 70 C26 40 52 24 76 30 C88 33 96 42 100 50 C104 42 112 33 124 30 C148 24 174 40 178 70 C182 104 160 132 100 176 Z" fill={C} {...ink} />
    <path d="M24 98 L70 98 L84 70 L102 130 L118 84 L128 98 L176 98" fill="none" stroke={W} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M48 60 C54 48 64 42 74 42" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const Flame = () => (
  <g>
    <path d="M100 8 C120 48 160 70 160 122 C160 160 132 188 100 188 C68 188 40 160 40 122 C40 92 58 76 70 56 C74 80 84 90 92 94 C88 64 92 34 100 8 Z" fill={C} {...ink} />
    <path d="M100 82 C110 108 132 120 132 146 C132 166 118 180 100 180 C82 180 68 166 68 146 C68 128 80 118 86 104 C90 118 96 122 100 124 Z" fill={Y} {...ink} strokeWidth={4} />
    <path d="M60 116 C60 100 66 88 74 80" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" />
  </g>
);

const WaterDrop = () => (
  <g>
    <path d="M100 14 C128 58 160 94 160 128 C160 162 134 186 100 186 C66 186 40 162 40 128 C40 94 72 58 100 14 Z" fill="#7FD3F0" {...ink} />
    <path d="M100 30 C124 70 150 100 150 128 C150 156 128 176 100 178 C124 160 132 128 100 30 Z" fill="#45AFD6" />
    <path d="M66 128 C66 108 76 94 86 82" fill="none" stroke={W} strokeWidth={9} strokeLinecap="round" />
  </g>
);

const Thinker = () => (
  <g>
    <path d="M58 92 C48 34 76 16 100 16 C128 16 152 34 142 96 L134 132 L66 132 Z" fill={K} />
    <path d="M28 196 C28 150 58 128 100 128 C142 128 172 150 172 196 Z" fill={M} {...ink} />
    <path d="M84 116 L84 136 C92 144 108 144 116 136 L116 116 Z" fill={S} {...ink} />
    <ellipse cx="100" cy="76" rx="34" ry="42" fill={S} {...ink} />
    <path d="M66 70 C70 46 88 36 104 38 C122 40 134 52 134 70 C118 58 96 54 80 50 C76 58 72 64 66 70 Z" fill={K} />
    <path d="M86 80 L86 82 M114 80 L114 82" stroke={K} strokeWidth={7} strokeLinecap="round" />
    <path d="M92 98 C98 96 104 96 110 98" fill="none" {...ink} strokeWidth={4} />
    <path d="M56 168 L72 152 M128 168 L144 152" {...hatch} stroke={MD} />
  </g>
);

const ICONS: Record<string, React.ReactNode> = {
  biceps: <Biceps />,
  bone: <BoneIco />,
  blood: <Drop />,
  heartfire: <HeartFire />,
  brain: <BrainIco />,
  muscleman: <Person shirt={M} hair="short" />,
  man: <Person shirt={M} hair="short" />,
  woman: <Person shirt={C} hair="long" />,
  bolt: <Bolt />,
  smile: <Smile />,
  scale: <ScaleIco />,
  burger: <Burger />,
  yawn: <Moon />,
  couch: <Couch />,
  stress: <Storm />,
  chart: <ChartDown />,
  pill: <Pill />,
  cell: <Cell />,
  dna: <Dna />,
  flebo: <Flebo />,
  tablet: <Tablet />,
  compressa: <Compressa />,
  brickNMN: <Brick fill={C} shade={CD} />,
  brickNR: <Brick fill={M} shade={MD} />,
  microscope: <Microscope />,
  sparkle: <Sparkle />,
  study: <Study />,
  check: <Check />,
  molecule: <Molecule />,
  hourglass: <Hourglass />,
  attention: <Attention />,
  bell: <Bell />,
  thumbup: <ThumbUp />,
  cursor: <Cursor />,
  shield: <Shield />,
  heartpulse: <HeartPulse />,
  flame: <Flame />,
  waterdrop: <WaterDrop />,
  thinker: <Thinker />,
};

export const Illo: React.FC<{ name: string; size: number; seed?: number }> = ({
  name,
  size,
  seed = 3,
}) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="-20 -20 240 240" width={size} height={size}>
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          {/* rough, slightly wobbly print edges */}
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={seed} result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
          {/* worn ink: sparse paper-white specks inside the shapes */}
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" seed={seed + 5} result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -60 0 0 0 16.5" result="specks" />
          <feComposite in="specks" in2="rough" operator="in" result="wear" />
          {/* white sticker outline */}
          <feMorphology in="rough" operator="dilate" radius="7" result="fat" />
          <feFlood floodColor={W} />
          <feComposite in2="fat" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="rough" />
            <feMergeNode in="wear" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{ICONS[name]}</g>
    </svg>
  );
};

export const hasIllo = (name: string) => name in ICONS;
