import { AbsoluteFill, Img, staticFile } from "remotion";
import { Pin } from "../ContoGenerali/Scenes";
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

export const GeneraliPensioneCover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black", fontFamily: condensed }}>
    <AbsoluteFill
      style={{
        transform: "scale(1.45)",
        transformOrigin: "46% 33%",
        filter: "contrast(1.08) saturate(1.12) brightness(1.03)",
      }}
    >
      <Img
        src={staticFile("pensione/cover-frame.png")}
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
          "linear-gradient(180deg, rgba(40,4,8,0.97) 0%, rgba(51,5,10,0.94) 18%, rgba(70,8,14,0.6) 25%, rgba(90,10,18,0) 31%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(0,0,0,0) 55%, rgba(30,8,10,0.35) 100%)",
      }}
    />

    {/* logo */}
    <AbsoluteFill style={{ top: 170, alignItems: "center" }}>
      <Img
        src={staticFile("pensione/generali-logo-white.png")}
        style={{
          width: 290,
          filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.45))",
        }}
      />
    </AbsoluteFill>

    {/* sticker */}
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 930,
        transform: "rotate(8deg)",
        ...box(colors.red),
        color: colors.white,
        fontSize: 64,
        fontWeight: 800,
        letterSpacing: 3,
      }}
    >
      PENSIONE
    </div>

    {/* headline */}
    <AbsoluteFill
      style={{
        top: 1040,
        alignItems: "center",
        textAlign: "center",
        color: colors.white,
        textShadow: outline,
      }}
    >
      <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
        Come immagini la tua vita a
      </div>
      <div
        style={{
          ...box(colors.red),
          fontSize: 150,
          whiteSpace: "nowrap",
          fontWeight: 800,
          lineHeight: 1.05,
          margin: "14px 0 10px",
          transform: "rotate(-2deg)",
        }}
      >
        65 ANNI?
      </div>
      <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1.05 }}>
        Il tempo è adesso
      </div>
      <div
        style={{
          ...box(colors.white),
          color: colors.red,
          fontSize: 54,
          fontWeight: 800,
          letterSpacing: 2,
          marginTop: 34,
        }}
      >
        PREVIDENZA COMPLEMENTARE
      </div>
    </AbsoluteFill>

    {/* location */}
    <AbsoluteFill
      style={{
        top: 1570,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 14,
        color: colors.white,
        fontSize: 48,
        fontWeight: 700,
        textShadow: outline,
      }}
    >
      <Pin size={40} />
      <div>Frascati · Piazza Roma</div>
    </AbsoluteFill>
  </AbsoluteFill>
);
