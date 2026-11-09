import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const WALL_FPS = 30;
export const WALL_DURATION = 300; // 10 s

// Car-only shots (Ferrari close-ups) left out on request.
const EXCLUDED = new Set([12, 14, 15, 18]);
// Night shots (0-27, 43-45) and photowall shots (28-42) interleaved so the white
// backdrops are spread over the wall instead of clustering together.
const ORDER = (() => {
  const night = [...Array.from({ length: 28 }, (_, i) => i), 43, 44, 45].filter(
    (i) => !EXCLUDED.has(i),
  );
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
  staticFile(
    `distretto/p${String(ORDER[i % ORDER.length]).padStart(2, "0")}.jpg`,
  );

// 10 s cuts from the Coldiretti (v00-v02) and Mediolanum (v03-v10) reels.
const VIDEO_COUNT = 11;
const video = (i: number) =>
  staticFile(`distretto/v/v${String(i % VIDEO_COUNT).padStart(2, "0")}.mp4`);

const CARD_W = 340;
const CARD_H = 510;
const GAP = 28;
const PITCH = CARD_H + GAP;

const Column: React.FC<{ col: number; cols: number; wallH: number }> = ({
  col,
  cols,
  wallH,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const center = (cols - 1) / 2;
  const dist = Math.abs(col - center) / center; // 0 centre .. 1 edge
  const dir = col % 2 === 0 ? 1 : -1;
  // Seamless loop: every column travels exactly one period of its cards over
  // the whole video, so the last frame flows straight back into the first.
  // Different period lengths give each column its own speed.
  const perCol = 5 + ((col + 1) % 3);
  const loop = perCol * PITCH;
  const speed = loop / durationInFrames;
  const offset = (((frame * speed * dir + col * 173) % loop) + loop) % loop;
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
      {Array.from({ length: perCol + 10 }, (_, r) => {
        const top = r * PITCH;
        // Skip cards that sit outside the wall this frame (saves decoding).
        if (top - offset > wallH || top - offset + CARD_H < 0) return null;
        const slot = col * 11 + (r % perCol);
        const isVideo = slot % 3 === 1;
        const media = {
          width: "100%",
          height: "100%",
          objectFit: "cover",
        } as const;
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              top,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 18,
              overflow: "hidden",
              background: "#1a1326",
              boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
            }}
          >
            {isVideo ? (
              <OffthreadVideo
                src={video(Math.floor(slot / 3))}
                muted
                style={media}
              />
            ) : (
              <Img src={photo(slot)} style={media} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const DistrettoWall: React.FC = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;

  const cols = 13;
  const wallW = cols * (CARD_W + GAP);
  const wallH = 2.4 * Math.max(width, height);

  // No intro, zoom drift or fades: the clip is meant to loop forever.
  const scale = vertical ? 0.8 : 1;

  return (
    <AbsoluteFill style={{ background: "#0d0816" }}>
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
            <Column key={c} col={c} cols={cols} wallH={wallH} />
          ))}
        </div>
      </AbsoluteFill>

      {/* purple tint + soft vignette */}
      <AbsoluteFill
        style={{
          background: "rgba(60, 25, 120, 0.42)",
          mixBlendMode: "multiply",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(13,8,22,0.5) 0%, rgba(13,8,22,0) 25%, rgba(13,8,22,0) 70%, rgba(13,8,22,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
