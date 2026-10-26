import {
  AbsoluteFill,
  Audio,
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
// In frames (24 fps) so edges can sit exactly on the interview's own cuts,
// otherwise a few frames of the outgoing shot flash before the cut.
type Broll = { at: number; to: number; src: string; from?: number };

type Edit = {
  main: string;
  // Music bed, pre-mixed under the voice (see public/bonsalto/music).
  music: string;
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
    music: "valdicielo-holocene",
    duration: 26.83,
    subs: VALDICIELO_SUBS,
    // Interview cuts at frames 210, 377, 503.
    broll: [
      { at: 129, to: 210, src: "broll5-paesaggio" },
      // Stabilised, then slowed to 0.5x with motion interpolation.
      { at: 263, to: 320, src: "broll4-grappoli-slow" },
      { at: 320, to: 377, src: "broll3-grappolo-mano", from: 10 },
      { at: 444, to: 503, src: "broll2-bottiglia-valdicielo-stab" },
      { at: 503, to: 559, src: "broll1-sole", from: 7 },
      // Stabilised copy of the interview from frame 503 (bottle on the vine).
      { at: 559, to: 644, src: "valdicielo-finale-stab", from: 56 },
    ],
  },
  bernesco: {
    main: "bernesco",
    music: "bernesco-mr-brightside",
    duration: 35.41,
    subs: BERNESCO_SUBS,
    // Interview cuts at frames 247, 500, 604, 720.
    broll: [
      { at: 370, to: 444, src: "broll8-ceppo-stab", from: 7 },
      { at: 663, to: 720, src: "broll7-bottiglia-bernesco" },
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
  const { main, music, subs, broll } = EDITS[wine];
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo src={clip(main)} />
      <Audio src={staticFile(`bonsalto/music/${music}.m4a`)} />
      {broll.map(({ at, to, src, from = 0 }) => (
        <Sequence key={`${src}-${at}`} from={at} durationInFrames={to - at}>
          <OffthreadVideo src={clip(src)} startFrom={from} muted />
        </Sequence>
      ))}
      <Subtitles subs={subs} />
    </AbsoluteFill>
  );
};
