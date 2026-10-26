import {
  AbsoluteFill,
  continueRender,
  delayRender,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BERNESCO_SUBS, Sub, VALDICIELO_SUBS } from "./subs";

export const BONSALTO_FPS = 24;

const sans = "Jost";

// Fonts are bundled in public/fonts so rendering works offline.
const fontHandle = delayRender("Loading Jost");
Promise.all(
  (["400", "500"] as const).map((weight) =>
    new FontFace(
      sans,
      `url(${staticFile(`fonts/jost-latin-${weight}-normal.woff2`)})`,
      { weight },
    )
      .load()
      .then((font) => document.fonts.add(font)),
  ),
).then(() => continueRender(fontHandle));

// A cutaway laid over the interview: the interview audio keeps running.
type Broll = { at: number; to: number; src: string; from?: number };

type Edit = {
  main: string;
  duration: number;
  subs: Sub[];
  broll: Broll[];
};

// All clips in public/bonsalto/graded are already colour graded
// (warmer balance, boosted greens/yellows, highlight roll-off).
const clip = (name: string) => staticFile(`bonsalto/graded/${name}.mp4`);

const EDITS = {
  valdicielo: {
    main: "valdicielo",
    duration: 26.83,
    subs: VALDICIELO_SUBS,
    broll: [
      { at: 5.18, to: 8.56, src: "broll5-paesaggio" },
      { at: 10.96, to: 13.24, src: "broll4-grappoli", from: 0.5 },
      { at: 13.34, to: 15.7, src: "broll3-grappolo-mano", from: 0.4 },
      { at: 18.46, to: 20.9, src: "broll2-bottiglia-valdicielo" },
      { at: 20.96, to: 23.3, src: "broll1-sole", from: 0.3 },
    ],
  },
  bernesco: {
    main: "bernesco",
    duration: 35.41,
    subs: BERNESCO_SUBS,
    broll: [
      { at: 6.2, to: 9.56, src: "broll5-paesaggio" },
      { at: 10.38, to: 12.7, src: "broll6-vite-antica" },
      { at: 15.4, to: 18.5, src: "broll8-ceppo", from: 0.3 },
      { at: 27.38, to: 29.75, src: "broll7-bottiglia-bernesco" },
    ],
  },
} satisfies Record<string, Edit>;

export type BonsaltoWine = keyof typeof EDITS;

export const bonsaltoDuration = (wine: BonsaltoWine) =>
  Math.round(EDITS[wine].duration * BONSALTO_FPS);

// Small, clean white words in the lower third, hard cuts between chunks.
const Subtitles: React.FC<{ subs: Sub[] }> = ({ subs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const current = subs.find(([start, end]) => t >= start && t < end);
  if (!current) return null;
  return (
    <AbsoluteFill style={{ alignItems: "center", top: "63%" }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 46,
          color: "white",
          textAlign: "center",
          maxWidth: 820,
          lineHeight: 1.2,
          textShadow: "0 1px 10px rgba(0,0,0,0.35), 0 0 2px rgba(0,0,0,0.25)",
        }}
      >
        {current[2]}
      </div>
    </AbsoluteFill>
  );
};

export const Bonsalto: React.FC<{ wine: BonsaltoWine }> = ({ wine }) => {
  const { main, subs, broll } = EDITS[wine];
  const f = (s: number) => Math.round(s * BONSALTO_FPS);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={clip(main)} />
      {broll.map(({ at, to, src, from = 0 }) => (
        <Sequence
          key={`${src}-${at}`}
          from={f(at)}
          durationInFrames={f(to) - f(at)}
        >
          <OffthreadVideo src={clip(src)} startFrom={f(from)} muted />
        </Sequence>
      ))}
      <Subtitles subs={subs} />
    </AbsoluteFill>
  );
};
