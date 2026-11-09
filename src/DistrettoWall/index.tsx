import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const WALL_FPS = 30;
export const WALL_DURATION = 300; // 10 s

const PHOTO_COUNT = 46;
// Night shots (0-27, 43-45) and photowall shots (28-42) interleaved so the white
// backdrops are spread over the wall instead of clustering together.
const ORDER = (() => {
  const night = [...Array.from({ length: 28 }, (_, i) => i), 43, 44, 45];
  const wall = Array.from({ length: 15 }, (_, i) => 28 + i);
  const out: number[] = [];
  while (night.length || wall.length) {
    if (night.length) out.push(night.shift()!);
    if (night.length) out.push(night.shift()!);
    if (wall.length) out.push(wall.shift()!);
  }
  return out;
})();

const photo = (i: number) =>
  staticFile(`distretto/p${String(ORDER[i % PHOTO_COUNT]).padStart(2, "0")}.jpg`);

const CARD_W = 340;
const CARD_H = 510;
const GAP = 28;
const PITCH = CARD_H + GAP;
const PER_COL = 6;
const LOOP = PER_COL * PITCH;

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const Column: React.FC<{ col: number; cols: number }> = ({ col, cols }) => {
  const frame = useCurrentFrame();
  const center = (cols - 1) / 2;
  const dist = Math.abs(col - center) / center; // 0 centre .. 1 edge
  const dir = col % 2 === 0 ? 1 : -1;
  const speed = 2.2 + (col % 3) * 0.6;
  const offset = (((frame * speed * dir + col * 173) % LOOP) + LOOP) % LOOP;
  // Alternate depth planes: far columns sit back and go soft, like the
  // shallow depth of field in the reference.
  const depth = [0, -320, 90][col % 3];
  const blur = (depth < 0 ? 6 : 0) + Math.max(0, dist - 0.55) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: col * (CARD_W + GAP),
        top: -offset,
        width: CARD_W,
        transform: `translateZ(${depth}px)`,
        filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : undefined,
      }}
    >
      {Array.from({ length: PER_COL * 2 + 2 }, (_, r) => (
        <div
          key={r}
          style={{
            position: "absolute",
            top: r * PITCH,
            width: CARD_W,
            height: CARD_H,
            borderRadius: 18,
            overflow: "hidden",
            background: "#1a1326",
            boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          }}
        >
          <Img
            src={photo(col * PER_COL + (r % PER_COL) + col * 5)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ))}
    </div>
  );
};

export const DistrettoWall: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const vertical = height > width;

  const cols = 13;
  const wallW = cols * (CARD_W + GAP);
  const wallH = 2.4 * Math.max(width, height);

  const intro = interpolate(frame, [0, 45], [0, 1], {
    extrapolateRight: "clamp",
    easing: ease,
  });
  const base = vertical ? 0.8 : 1;
  const scale = base * interpolate(intro, [0, 1], [1.35, 1]) *
    interpolate(frame, [45, durationInFrames], [1, 1.06], {
      extrapolateLeft: "clamp",
    });
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#0d0816", opacity: fadeIn * fadeOut }}>
      <AbsoluteFill style={{ perspective: 1800, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: (width - wallW) / 2,
            top: (height - wallH) / 2,
            width: wallW,
            height: wallH,
            transformStyle: "preserve-3d",
            transform: `scale(${scale}) rotateX(18deg) rotateY(-10deg) rotateZ(-16deg)`,
          }}
        >
          {Array.from({ length: cols }, (_, c) => (
            <Column key={c} col={c} cols={cols} />
          ))}
        </div>
      </AbsoluteFill>

      {/* purple tint + soft vignette */}
      <AbsoluteFill style={{ background: "rgba(60, 25, 120, 0.42)", mixBlendMode: "multiply" }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(13,8,22,0.5) 0%, rgba(13,8,22,0) 25%, rgba(13,8,22,0) 70%, rgba(13,8,22,0.6) 100%)",
        }}
      />

    </AbsoluteFill>
  );
};
