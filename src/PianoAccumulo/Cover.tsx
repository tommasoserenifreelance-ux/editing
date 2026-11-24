import { AbsoluteFill, Img, staticFile } from "remotion";
import { colors, condensed, outline } from "../ContoGenerali/theme";

// 9:16 reel cover. The profile grid crops it to the central 3:4
// (y 240–1680), so everything important sits inside that band.

const box = (bg: string): React.CSSProperties => ({
  background: bg,
  padding: "4px 28px 10px",
  borderRadius: 12,
  textShadow: "none",
  boxShadow: "0 14px 34px rgba(0,0,0,0.4)",
});

export const PianoAccumuloCover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black", fontFamily: condensed }}>
    <AbsoluteFill
      style={{
        transform: "scale(1.45)",
        transformOrigin: "49% 33%",
        filter: "contrast(1.08) saturate(1.12) brightness(1.03)",
      }}
    >
      <Img
        src={staticFile("accumulo/cover-frame.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(51,5,10,0) 45%, rgba(90,10,18,0.75) 70%, rgba(51,5,10,0.95) 100%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.97) 17%, rgba(255,255,255,0.7) 23%, rgba(255,255,255,0) 30%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(0,0,0,0) 55%, rgba(30,8,10,0.35) 100%)",
      }}
    />

    {/* logo */}
    <AbsoluteFill style={{ top: 105, alignItems: "center" }}>
      <Img
        src={staticFile("accumulo/generali-logo-red.png")}
        style={{
          width: 330,
          filter: "none",
        }}
      />
    </AbsoluteFill>

    {/* headline */}
    <AbsoluteFill
      style={{
        top: 1120,
        alignItems: "center",
        textAlign: "center",
        color: colors.white,
        textShadow: outline,
      }}
    >
      <div
        style={{
          ...box(colors.red),
          fontSize: 112,
          whiteSpace: "nowrap",
          fontWeight: 800,
          lineHeight: 1.05,
          marginBottom: 30,
        }}
      >
        PIANO D'ACCUMULO
      </div>
      <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.15 }}>
        Il futuro dei tuoi figli
        <br />
        inizia oggi
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
