// Flat white glyphs drawn in a 100x100 box, placed inside a <Bubble>.
const W = "#fff";

export const Dumbbell = () => (
  <g fill={W}>
    <rect x="8" y="36" width="12" height="28" rx="4" />
    <rect x="20" y="28" width="12" height="44" rx="4" />
    <rect x="68" y="28" width="12" height="44" rx="4" />
    <rect x="80" y="36" width="12" height="28" rx="4" />
    <rect x="32" y="45" width="36" height="10" rx="3" />
  </g>
);

export const Bone = () => (
  <g fill={W} transform="rotate(-35 50 50)">
    <rect x="22" y="42" width="56" height="16" rx="6" />
    <circle cx="20" cy="40" r="11" />
    <circle cx="20" cy="60" r="11" />
    <circle cx="80" cy="40" r="11" />
    <circle cx="80" cy="60" r="11" />
  </g>
);

export const Cells = () => (
  <g fill="none" stroke={W} strokeWidth="9">
    <ellipse cx="38" cy="40" rx="22" ry="17" />
    <ellipse cx="64" cy="64" rx="22" ry="17" />
    <ellipse cx="38" cy="40" rx="6" ry="3" fill={W} />
    <ellipse cx="64" cy="64" rx="6" ry="3" fill={W} />
  </g>
);

export const Heart = () => (
  <path
    fill={W}
    d="M50 86 C20 64 8 48 8 32 C8 18 19 9 31 9 C40 9 46 14 50 21 C54 14 60 9 69 9 C81 9 92 18 92 32 C92 48 80 64 50 86 Z"
  />
);

export const Bolt = () => (
  <polygon fill={W} points="58,4 18,56 46,56 38,96 82,40 54,40" />
);

export const Smile = () => (
  <g fill="none" stroke={W} strokeWidth="9" strokeLinecap="round">
    <circle cx="50" cy="50" r="38" />
    <path d="M32 58 Q50 76 68 58" />
    <circle cx="37" cy="40" r="3" fill={W} />
    <circle cx="63" cy="40" r="3" fill={W} />
  </g>
);

export const Scale = () => (
  <g fill={W}>
    <rect x="10" y="16" width="80" height="72" rx="16" />
    <path d="M30 42 A20 20 0 0 1 70 42 Z" fill="rgba(0,0,0,0.25)" />
    <rect x="48" y="26" width="5" height="16" rx="2" transform="rotate(35 50 42)" fill="rgba(0,0,0,0.55)" />
  </g>
);

export const Belly = () => (
  <g fill="none" stroke={W} strokeWidth="9" strokeLinecap="round">
    <path d="M30 8 C30 30 14 40 14 60 C14 80 30 92 50 92 C70 92 86 80 86 60 C86 40 70 30 70 8" />
    <path d="M14 58 H86" strokeDasharray="7 7" />
  </g>
);

export const Moon = () => (
  <g fill={W}>
    <path d="M62 8 A42 42 0 1 0 92 66 A34 34 0 1 1 62 8 Z" />
    <text x="64" y="38" fontSize="22" fontWeight="800" fontFamily="Inter">
      z
    </text>
  </g>
);

export const Couch = () => (
  <g fill={W}>
    <rect x="18" y="30" width="64" height="30" rx="8" />
    <rect x="6" y="44" width="18" height="34" rx="7" />
    <rect x="76" y="44" width="18" height="34" rx="7" />
    <rect x="20" y="58" width="60" height="18" rx="5" />
    <rect x="14" y="76" width="7" height="12" rx="2" />
    <rect x="79" y="76" width="7" height="12" rx="2" />
  </g>
);

export const Storm = () => (
  <g fill={W}>
    <path d="M24 56 A18 18 0 0 1 28 21 A24 24 0 0 1 72 22 A17 17 0 0 1 76 56 Z" />
    <polygon points="52,52 36,78 48,78 42,98 66,68 54,68 60,52" />
  </g>
);

export const Brain = () => (
  <g fill="none" stroke={W} strokeWidth="8" strokeLinecap="round">
    <path d="M50 18 C40 6 18 12 20 30 C6 34 8 56 20 60 C18 78 38 86 50 76 C62 86 82 78 80 60 C92 56 94 34 80 30 C82 12 60 6 50 18 Z" />
    <path d="M50 18 V76" />
  </g>
);

export const Body = () => (
  <g fill={W}>
    <circle cx="50" cy="18" r="13" />
    <path d="M26 38 Q50 30 74 38 L68 70 L60 70 L58 96 L42 96 L40 70 L32 70 Z" />
  </g>
);

export const Person = () => (
  <g fill="#fff">
    <circle cx="50" cy="36" r="20" />
    <path d="M14 96 C14 70 30 60 50 60 C70 60 86 70 86 96 Z" />
  </g>
);
