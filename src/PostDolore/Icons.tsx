import React from "react";

// Figura femminile stilizzata per la copertina
export const WomanIcon: React.FC<{ color: string; height: number }> = ({ color, height }) => (
  <svg viewBox="0 0 160 330" height={height} width={(height * 160) / 330}>
    <circle cx={80} cy={34} r={30} fill={color} />
    <path
      d="M48,78 C56,72 104,72 112,78 L148,178 C152,190 138,196 132,186 L110,138 L132,226 L28,226 L50,138 L28,186 C22,196 8,190 12,178 Z"
      fill={color}
    />
    <rect x={48} y={220} width={26} height={104} rx={13} fill={color} />
    <rect x={86} y={220} width={26} height={104} rx={13} fill={color} />
  </svg>
);

// Testa di profilo con cervello e fulmini (emicrania)
export const MigraineIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg viewBox="0 0 240 240" width={size} height={size} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M80,222 L80,196 C80,186 70,184 60,182 C50,180 48,172 52,164 L44,150 C40,144 44,138 50,136 C46,120 48,108 56,96 C64,62 100,40 140,42 C186,44 214,80 212,122 C210,152 196,172 182,186 L184,222" />
    <path d="M96,118 C90,100 104,84 120,88 C124,74 146,72 152,84 C166,78 182,90 178,104 C192,110 190,130 176,134 C176,148 160,154 150,146 C142,158 122,158 116,146 C102,150 90,138 96,126 Z" />
    <path d="M120,100 C128,106 128,116 120,122" />
    <path d="M148,96 C142,106 150,114 158,112" />
    <path d="M132,132 C140,126 152,128 156,136" />
    <polyline points="40,24 58,52 44,56 66,84" />
    <polyline points="78,8 86,34 74,36 88,60" />
    <polyline points="10,62 34,74 24,84 46,96" />
  </svg>
);

// Linea che sale e scende: estrogeni che oscillano
export const WaveIcon: React.FC<{ color: string; width: number }> = ({ color, width }) => (
  <svg viewBox="0 0 900 160" width={width} height={(width * 160) / 900} fill="none">
    <path
      d="M0,90 C40,90 50,30 90,30 C130,30 120,140 170,140 C220,140 210,10 260,10 C310,10 300,120 340,120 C380,120 380,50 420,50 C470,50 450,150 510,150 C560,150 550,20 600,20 C650,20 640,110 690,110 C730,110 730,60 770,60 C820,60 820,130 860,130 C880,130 890,110 900,100"
      stroke={color}
      strokeWidth={7}
      strokeLinecap="round"
    />
  </svg>
);
