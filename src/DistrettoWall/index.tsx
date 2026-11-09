import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";

export const WALL_FPS = 30;
export const WALL_DURATION = 300; // 10 s

const PHOTO_COUNT = 43;
// Night shots (0-27) and photowall shots (28-42) interleaved so the white
// backdrops are spread over the wall instead of clustering together.
const ORDER = (() => {
  const night = Array.from({ length: 28 }, (_, i) => i);
  const wall = Array.from({ length: PHOTO_COUNT - 28 }, (_, i) => 28 + i);
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

type Props = { title: string; subtitle: string };

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

const Reveal: React.FC<{ children: React.ReactNode; delay: number }> = ({
  children,
  delay,
}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ transform: `translateY(${(1 - t) * 110}%)` }}>
        {children}
      </div>
    </div>
  );
};

export const DistrettoWall: React.FC<Props> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const fontFamily = sans;
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

  const titleSize = vertical ? 132 : 120;
  const pad = vertical ? 70 : 90;

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

      {/* purple tint + bottom gradient for legibility */}
      <AbsoluteFill style={{ background: "rgba(60, 25, 120, 0.42)", mixBlendMode: "multiply" }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(13,8,22,0.55) 0%, rgba(13,8,22,0) 22%, rgba(13,8,22,0) 45%, rgba(13,8,22,0.92) 100%)",
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: pad,
          paddingBottom: vertical ? 260 : 110,
          color: "white",
          fontFamily,
        }}
      >
        <Reveal delay={14}>
          <div style={{ fontSize: 30, fontWeight: 500, letterSpacing: 8, opacity: 0.85, marginBottom: 18 }}>
            {subtitle.toUpperCase()}
          </div>
        </Reveal>
        <Reveal delay={20}>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: -2,
              textShadow: "0 10px 40px rgba(0,0,0,0.5)",
            }}
          >
            {title}
          </div>
        </Reveal>
        <Reveal delay={30}>
          <div
            style={{
              marginTop: 34,
              display: "flex",
              gap: 18,
              fontSize: 28,
              fontWeight: 500,
            }}
          >
            <span style={{ background: "#7b3cf0", padding: "14px 34px", borderRadius: 999 }}>
              Gallery
            </span>
            <span
              style={{
                border: "2px solid rgba(255,255,255,0.5)",
                padding: "12px 32px",
                borderRadius: 999,
              }}
            >
              Contatti
            </span>
          </div>
        </Reveal>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
