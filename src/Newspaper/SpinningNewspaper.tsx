import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const PAPER_ASPECT = 1024 / 1536;
const SPIN_FRAMES = 54;
const TURNS = 4;
// Final zoom target, as a fraction of the page height (headline area).
const HEADLINE_Y = 0.22;

export const SpinningNewspaper: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const paperHeight = height * 0.92;
  const paperWidth = paperHeight * PAPER_ASPECT;

  // 1. Spin in: spiral from the center while growing toward the camera.
  const spin = interpolate(frame, [0, SPIN_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const rotation = interpolate(spin, [0, 1], [-360 * TURNS - 8, -8]);
  const spinScale = interpolate(spin, [0, 1], [0.02, 1.08]);

  // 2. Landing: settle from the slight overshoot and straighten up.
  const land = spring({
    frame: frame - SPIN_FRAMES,
    fps,
    config: { damping: 11, stiffness: 140, mass: 0.8 },
  });
  const settleRotation = interpolate(land, [0, 1], [0, 8]);
  const settleScale = interpolate(land, [0, 1], [1, 1 / 1.08]);

  // 3. Slow push-in toward the headline.
  const zoomStart = SPIN_FRAMES + 45;
  const zoom = interpolate(frame, [zoomStart, durationInFrames - 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const zoomScale = interpolate(zoom, [0, 1], [1, 1.75]);
  const zoomShift = interpolate(
    zoom,
    [0, 1],
    [0, (0.5 - HEADLINE_Y) * paperHeight],
  );

  const scale = spinScale * settleScale * zoomScale;

  // Blur while spinning fast, fading as it slows down.
  const blur = interpolate(spin, [0, 0.6, 0.95], [6, 2, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #3a3a3a 0%, #151515 60%, #050505 100%)",
        opacity: fadeOut,
      }}
    >
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: paperWidth,
            height: paperHeight,
            opacity,
            transform: `translateY(${zoomShift * zoomScale}px) scale(${scale}) rotate(${rotation + settleRotation}deg)`,
            filter: `blur(${blur}px)`,
            boxShadow: `0 ${30 * scale}px ${80 * scale}px rgba(0,0,0,0.65)`,
          }}
        >
          <Img
            src={staticFile("newspaper.jpg")}
            style={{ width: "100%", height: "100%", display: "block" }}
          />
        </div>
      </AbsoluteFill>
      {/* Soft vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          width,
          height,
        }}
      />
    </AbsoluteFill>
  );
};
