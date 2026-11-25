import {
  AbsoluteFill,
  Audio,
  Freeze,
  Img,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Same format as the sushi reel (BeatSushi): each roll is set down on the
// yellow placemat in real time, the frame freezes like a photo, then a warm
// flash cuts to the next roll; logo at the end. No dish names yet (to come).
// Clip: public/beat/rolls/c5.mp4 (beat.ref.5, client's grade). It is itself
// an edit of three takes (cuts at 3.00 and 5.21 s); each shot stays inside
// its take. Freezes use the video itself so colours never shift.
export const ROLLS_FPS = 24;

const SRC = staticFile("beat/rolls/c5.mp4");

// pre = [from, to] source seconds played in real time; the freeze holds the
// frame at `to` once the plate has settled.
type Shot = { pre: [number, number]; hold: number };
const SHOTS: Shot[] = [
  { pre: [0.4, 1.6], hold: 46 }, // tuna roll
  { pre: [3.55, 4.2], hold: 46 }, // roll with crispy orange garnish
  { pre: [5.7, 6.6], hold: 46 }, // roll with red and orange topping
];
const END = 40; // last roll, dimmed, with the logo

const f24 = (s: number) => Math.round(s * ROLLS_FPS);
const preFrames = (s: Shot) => f24(s.pre[1] - s.pre[0]);
const shotFrames = (s: Shot) => preFrames(s) + s.hold;
const starts = SHOTS.reduce<number[]>(
  (acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + shotFrames(SHOTS[i - 1])],
  [],
);
const END_AT = starts[starts.length - 1] + shotFrames(SHOTS[SHOTS.length - 1]);
export const ROLLS_DURATION = END_AT + END;

const full: React.CSSProperties = { width: "100%", height: "100%" };

const ShotView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const pre = preFrames(s);
  return (
    <Freeze frame={pre - 1} active={f >= pre}>
      <OffthreadVideo src={SRC} startFrom={f24(s.pre[0])} muted style={full} />
    </Freeze>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const k = interpolate(f, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const last = SHOTS[SHOTS.length - 1];
  return (
    <AbsoluteFill>
      <Freeze frame={preFrames(last) - 1}>
        <OffthreadVideo
          src={SRC}
          startFrom={f24(last.pre[0])}
          muted
          style={{
            ...full,
            filter: `blur(${6 * k}px) brightness(${1 - 0.3 * k})`,
          }}
        />
      </Freeze>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", opacity: k }}
      >
        <Img
          src={staticFile("beat/logo-bianco.png")}
          style={{
            width: 340,
            filter: "drop-shadow(0 2px 12px rgba(0,0,0,0.4))",
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Warm film flash on every cut, as in the sushi reel.
const Flash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  const burst = interpolate(f, [-1, 0, 1, 3], [0, 0.95, 0.55, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (burst === 0) return null;
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at 40% 45%, #fffbe8 0%, #ffd27a 35%, #ff7a1f 70%, rgba(255,90,0,0.6) 100%)",
        mixBlendMode: "screen",
        opacity: burst,
      }}
    />
  );
};

export const BeatRolls: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    {SHOTS.map((s, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={shotFrames(s)}>
        <ShotView s={s} />
      </Sequence>
    ))}
    <Sequence from={END_AT} durationInFrames={END}>
      <EndCard />
    </Sequence>
    {[...starts.slice(1), END_AT].map((c) => (
      <Flash key={c} at={c} />
    ))}
    <Audio
      src={staticFile("beat/sushi/reference2-audio.m4a")}
      volume={(f) =>
        interpolate(f, [ROLLS_DURATION - 12, ROLLS_DURATION], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
  </AbsoluteFill>
);
