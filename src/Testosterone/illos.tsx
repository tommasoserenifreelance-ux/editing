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
