import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, sans } from "../PilatesReformer/theme";

export const OVERLAY_FPS = 30;
export const OVERLAY_DURATION = 432; // 14.4 s, length of the source clip

const HOOK = 75;
const REASON = (OVERLAY_DURATION - HOOK) / 5;

const REASONS: string[][] = [
  ["Rinforzi il core", "senza stressare", "le articolazioni"],
  ["Migliori la postura"],
  ["È adatto", "a tutti i livelli"],
  ["Tonifichi in modo", "lungo ed elastico"],
  ["Allena la mente,", "non solo il corpo"],
];

// Pop in at the start, fade out just before the next caption.
const useEnterExit = (duration: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.6 } });
  const exit = interpolate(frame, [duration - 6, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    opacity: Math.min(1, enter * 2) * exit,
    transform: `translateY(${interpolate(enter, [0, 1], [-40, 0])}px) scale(${interpolate(enter, [0, 1], [0.85, 1])})`,
  };
};

const boxed: React.CSSProperties = {
  display: "inline",
  padding: "6px 22px",
  borderRadius: 14,
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
};

const Caption: React.FC<{ children: React.ReactNode; duration: number }> = ({
  children,
  duration,
}) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
    <div
      style={{
        ...useEnterExit(duration),
        width: 940,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: sans,
        filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.25))",
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

const Hook: React.FC = () => (
  <Caption duration={HOOK}>
    <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.5 }}>
      <span style={{ ...boxed, background: colors.bg, color: colors.ink }}>
        5 motivi per iniziare
      </span>
    </div>
    <div
      style={{
        fontSize: 70,
        fontWeight: 700,
        lineHeight: 1.35,
        letterSpacing: 2,
      }}
    >
      <span style={{ ...boxed, background: colors.accent, color: "#fff" }}>
        OGGI STESSO
      </span>
    </div>
    <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.5 }}>
      <span style={{ ...boxed, background: colors.bg, color: colors.ink }}>
        il Pilates Reformer
      </span>
    </div>
  </Caption>
);

const Reason: React.FC<{ index: number; lines: string[] }> = ({
  index,
  lines,
}) => (
  <Caption duration={REASON}>
    {lines.map((line, i) => (
      <div
        key={line}
        style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.5 }}
      >
        {i === 0 ? (
          <span
            style={{
              ...boxed,
              background: colors.accent,
              color: "#fff",
              marginRight: 12,
            }}
          >
            {index}
          </span>
        ) : null}
        <span style={{ ...boxed, background: colors.bg, color: colors.ink }}>
          {line}
        </span>
      </div>
    ))}
  </Caption>
);

export const PilatesOverlay: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile("video/reformer.mov")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Sequence durationInFrames={HOOK}>
        <Hook />
      </Sequence>
      {REASONS.map((lines, i) => (
        <Sequence
          key={lines[0]}
          from={HOOK + i * REASON}
          durationInFrames={REASON}
        >
          <Reason index={i + 1} lines={lines} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
