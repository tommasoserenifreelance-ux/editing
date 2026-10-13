import React from "react";
import { colors } from "./theme";

const hair = "#7A2A22";
const hairDark = "#561A14";
const skin = "#F6C7A8";
const skinLine = "#D99A7C";
const table = "#F4BE9C";
const tableEdge = "#E2A27F";
const coffee = "#4A2416";
const potDark = "#2E2B33";

// Donna sfinita sul tavolo mentre la tazza trabocca: "un'altra cosa" di troppo.
export const Illustration: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  return (
    <svg viewBox="0 0 1080 640" width={1080} height={640} style={style}>
      <defs>
        <pattern
          id="stripes"
          width="46"
          height="46"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(68)"
        >
          <rect width="46" height="46" fill={colors.white} />
          <rect width="21" height="46" fill={colors.plum} />
        </pattern>
      </defs>

      {/* Tavolo */}
      <rect x={0} y={404} width={1080} height={236} fill={table} />
      <rect x={0} y={404} width={1080} height={6} fill={tableEdge} />

      {/* Busto con camicia a righe */}
      <path
        d="M70,410 C80,300 150,215 270,200 C390,188 520,215 575,300 C600,345 605,380 600,410 Z"
        fill="url(#stripes)"
      />

      {/* Braccio disteso sul tavolo */}
      <path
        d="M520,235 C640,250 735,300 815,352 L796,412 C705,382 610,350 520,340 Z"
        fill="url(#stripes)"
      />
      {/* Mano abbandonata */}
      <path
        d="M800,352 C840,350 880,365 915,382 C930,390 925,404 910,404 L885,402 C900,410 896,422 880,420 L800,414 Z"
        fill={skin}
      />
      <path d="M850,378 C870,384 885,392 898,402" stroke={skinLine} strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* Ombra della testa */}
      <ellipse cx={300} cy={440} rx={260} ry={28} fill={tableEdge} opacity={0.6} />

      {/* Capelli sparsi sul tavolo */}
      <path
        d="M0,452 C30,432 70,448 100,428 L510,424 C540,436 575,430 600,452 C575,468 545,458 520,476 C490,496 452,478 424,498 C392,518 352,494 318,512 C286,528 254,500 222,516 C190,530 160,502 128,508 C96,514 66,492 36,498 C18,500 4,490 0,484 Z"
        fill={hair}
      />
      {/* Testa reclinata */}
      <path
        d="M92,432 C66,372 80,296 132,246 C176,204 232,184 292,182 C356,180 418,204 462,250 C506,296 522,364 508,432 Z"
        fill={hair}
      />
      {/* Onde laterali */}
      <path d="M92,300 C60,320 70,350 50,372 C40,384 56,396 72,384 C92,368 84,340 104,322 Z" fill={hair} />
      <path d="M490,300 C520,322 512,352 534,376 C544,388 528,398 512,386 C494,370 500,342 482,324 Z" fill={hair} />
      {/* Texture dei capelli */}
      {[
        "M292,190 C240,230 210,300 200,380 C196,410 180,440 150,470",
        "M292,190 C270,250 262,320 270,400 C274,440 262,470 240,500",
        "M292,190 C320,250 336,320 340,400 C342,440 360,470 380,495",
        "M292,190 C350,230 390,290 410,360 C420,400 440,430 470,455",
        "M292,190 C220,215 160,270 130,340 C116,380 90,420 50,455",
        "M292,190 C370,210 440,260 470,330 C484,370 500,400 540,440",
        "M180,470 C150,490 110,480 80,490",
        "M420,470 C450,488 490,470 520,462",
      ].map((d) => (
        <path key={d} d={d} stroke={hairDark} strokeWidth={4} fill="none" strokeLinecap="round" />
      ))}

      {/* Pozza di caffè */}
      <path
        d="M470,512 C440,500 470,478 530,480 C600,470 690,475 735,492 C780,505 770,528 720,532 C680,545 610,548 560,540 C510,540 480,528 470,512 Z"
        fill={coffee}
      />
      <circle cx={790} cy={520} r={9} fill={coffee} />
      <circle cx={815} cy={505} r={5} fill={coffee} />
      <circle cx={445} cy={530} r={6} fill={coffee} />

      {/* Piattino */}
      <ellipse cx={590} cy={505} rx={115} ry={22} fill={colors.white} />
      <ellipse cx={590} cy={500} rx={70} ry={11} fill="#EDE4E8" />

      {/* Tazza */}
      <path
        d="M660,445 C700,440 712,470 690,488 C680,496 668,494 662,488"
        stroke={colors.white}
        strokeWidth={14}
        fill="none"
      />
      <path d="M518,432 L662,432 C660,488 632,506 590,506 C548,506 520,488 518,432 Z" fill={colors.white} />
      <ellipse cx={590} cy={432} rx={72} ry={14} fill={coffee} />
      {/* Caffè che trabocca */}
      <path d="M525,434 C522,455 530,470 524,486 C520,496 532,498 534,486 C538,468 534,452 540,438 Z" fill={coffee} />
      <path d="M640,438 C646,452 642,468 650,480 C656,490 666,484 660,474 C654,462 658,450 655,436 Z" fill={coffee} />
      <path d="M596,446 C600,462 596,478 602,494 C606,502 614,498 612,488 C608,474 612,460 608,446 Z" fill={coffee} />

      {/* Getto di caffè */}
      <path d="M640,188 C612,230 596,320 592,430" stroke={coffee} strokeWidth={15} fill="none" strokeLinecap="round" />

      {/* Caffettiera (inclinata) */}
      <g transform="rotate(-40 720 205)">
        <path d="M790,150 C842,150 850,170 850,205 C850,240 842,258 790,258" stroke={potDark} strokeWidth={18} fill="none" />
        <rect x={650} y={118} width={140} height={175} rx={18} fill="#BFC3CB" />
        <rect x={650} y={200} width={140} height={93} rx={14} fill={coffee} />
        <rect x={668} y={135} width={18} height={140} rx={9} fill={colors.white} opacity={0.55} />
        <rect x={642} y={100} width={156} height={26} rx={10} fill={potDark} />
        <rect x={642} y={286} width={156} height={20} rx={8} fill={potDark} />
        <rect x={712} y={70} width={16} height={32} rx={4} fill={potDark} />
        <circle cx={720} cy={66} r={14} fill={potDark} />
        <path d="M650,128 L628,112 L652,112 Z" fill={potDark} />
      </g>

      {/* Mano che versa */}
      <path d="M1100,-20 C1000,20 900,70 845,110" stroke={colors.blush} strokeWidth={84} fill="none" strokeLinecap="round" />
      <path d="M865,98 C870,88 880,82 890,86" stroke={colors.white} strokeWidth={0} fill="none" />
      <ellipse cx={815} cy={130} rx={50} ry={42} fill={skin} />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${778 + i * 22},${110 + i * 6} C${770 + i * 22},${140 + i * 6} ${790 + i * 22},${160 + i * 4} ${800 + i * 22},${152 + i * 4}`}
          stroke={skinLine}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};
