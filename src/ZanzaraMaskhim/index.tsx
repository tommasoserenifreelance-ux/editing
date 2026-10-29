import {
  AbsoluteFill,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { sans } from "../PilatesReformer/theme";

export const ZANZARA_FPS = 30;
export const ZANZARA_DURATION = 2390; // 79.67 s, length of the source clip
export const ZANZARA_WIDTH = 1920;
export const ZANZARA_HEIGHT = 1036;

const boxed: React.CSSProperties = {
  display: "inline-block",
  padding: "4px 26px 8px",
  borderRadius: 12,
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 12, mass: 0.6 } });
  const line = (delay: number): React.CSSProperties => ({
    opacity: Math.min(1, pop(delay) * 2),
    transform: `scale(${interpolate(pop(delay), [0, 1], [0.6, 1])}) rotate(${interpolate(pop(delay), [0, 1], [-4, -2])}deg)`,
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        paddingTop: 28,
        fontFamily: sans,
        fontWeight: 700,
        textAlign: "center",
        filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.45))",
      }}
    >
      <div style={{ ...line(0), fontSize: 48, lineHeight: 1.25 }}>
        <span style={{ ...boxed, background: "#000", color: "#fff" }}>
          ALLA ZANZARA È ARRIVATO QUALCOSA DI MAI VISTO
        </span>
      </div>
      <div
        style={{
          ...line(6),
          fontSize: 72,
          lineHeight: 1.2,
          letterSpacing: 1,
          marginTop: 8,
        }}
      >
        <span style={{ ...boxed, background: "#fff", color: "#000" }}>
          ...SIAMO NOI DI MASKHIM
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      {/* Soft shade so the white logo reads over the white desk papers */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%)",
        }}
      />
      <Img
        src={staticFile("zanzara/maskhim-logo.png")}
        style={{
          width: 340,
          marginBottom: 46,
          opacity,
          filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.6))",
        }}
      />
    </AbsoluteFill>
  );
};

export const ZanzaraMaskhim: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <OffthreadVideo
        src={staticFile("zanzara/zanzara.mov")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Logo />
      <Hook />
    </AbsoluteFill>
  );
};
