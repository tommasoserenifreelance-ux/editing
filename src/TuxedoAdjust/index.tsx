import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";

export const TUXEDO_FPS = 30;
export const TUXEDO_DURATION = 210; // 7 s

const SRC = staticFile("images/tuxedo.webp");

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// One "tug" on the jacket: pull down quickly, then let the fabric settle back
// with a small overshoot.
const tug = (frame: number, start: number) =>
  interpolate(
    frame,
    [start, start + 9, start + 20, start + 28, start + 36],
    [0, 1, -0.18, 0.05, 0],
    { ...clamp, easing: Easing.inOut(Easing.sin) },
  );

// The front of the jacket and the hands move down while the chest above stays
// put. The band in between is cut into thin strips whose offset ramps from 0 to
// full, so the fabric stretches smoothly instead of ghosting.
const RAMP_TOP = 0.44;
const RAMP_BOTTOM = 0.64;
const STRIPS = 48;
const MAX_PULL = 18;

const Slice: React.FC<{ top: number; bottom: number; offset: number }> = ({
  top,
  bottom,
  offset,
}) => (
  <AbsoluteFill
    style={{
      // 1px of overlap hides seams between neighbouring strips.
      clipPath: `inset(calc(${top * 100}% - 1px) 0 calc(${(1 - bottom) * 100}% - 1px) 0)`,
      transform: `translateY(${offset}px)`,
    }}
  >
    <Img
      src={SRC}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

const JacketLayer: React.FC<{ pull: number }> = ({ pull }) => {
  const step = (RAMP_BOTTOM - RAMP_TOP) / STRIPS;
  return (
    <>
      {new Array(STRIPS).fill(true).map((_, i) => {
        const weight = interpolate(i + 0.5, [0, STRIPS], [0, 1], {
          easing: Easing.inOut(Easing.sin),
        });
        return (
          <Slice
            key={i}
            top={RAMP_TOP + i * step}
            bottom={RAMP_TOP + (i + 1) * step}
            offset={pull * MAX_PULL * weight}
          />
        );
      })}
      <Slice top={RAMP_BOTTOM} bottom={1.01} offset={pull * MAX_PULL} />
    </>
  );
};

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.22 }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={Math.floor(random(`g${frame}`) * 1000)}
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const TuxedoAdjust: React.FC = () => {
  const frame = useCurrentFrame();

  const pull = tug(frame, 40) + 0.7 * tug(frame, 112);

  // Slow push-in towards the bow tie, with a slight drift.
  const zoom = interpolate(frame, [0, TUXEDO_DURATION], [1.04, 1.16], clamp);
  const driftX = interpolate(frame, [0, TUXEDO_DURATION], [10, -14], clamp);
  const driftY = interpolate(frame, [0, TUXEDO_DURATION], [20, -10], clamp);
  // The whole body reacts a little to each tug.
  const bodyLift = pull * -3;

  // Warm light moving across the lapel.
  const sweep = interpolate(frame, [20, 170], [-60, 160], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  const fade = Math.min(
    interpolate(frame, [0, 18], [0, 1], clamp),
    interpolate(frame, [TUXEDO_DURATION - 15, TUXEDO_DURATION], [1, 0], clamp),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill
        style={{
          opacity: fade,
          filter: "contrast(1.08) saturate(0.9) brightness(1.02)",
          transformOrigin: "45% 30%",
          transform: `translate(${driftX}px, ${driftY + bodyLift}px) scale(${zoom})`,
        }}
      >
        <Img
          src={SRC}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <JacketLayer pull={pull} />
        <AbsoluteFill
          style={{
            mixBlendMode: "soft-light",
            background: `linear-gradient(115deg, transparent ${sweep - 25}%, rgba(255,214,160,0.55) ${sweep}%, transparent ${sweep + 25}%)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <Grain />
    </AbsoluteFill>
  );
};
