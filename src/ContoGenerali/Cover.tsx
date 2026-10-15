import { AbsoluteFill, Img, staticFile } from "remotion";
import { Pin } from "./Scenes";
import { colors, condensed, outline } from "./theme";

// 9:16 reel cover. The profile grid crops it to the central 3:4
// (y 240–1680), so everything important sits inside that band.

const box = (bg: string): React.CSSProperties => ({
  background: bg,
  padding: "4px 28px 10px",
  borderRadius: 12,
  textShadow: "none",
  boxShadow: "0 14px 34px rgba(0,0,0,0.4)",
});

export const ContoGeneraliCover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black", fontFamily: condensed }}>
    <AbsoluteFill
      style={{
        transform: "scale(1.22)",
        transformOrigin: "55% 30%",
        filter: "contrast(1.08) saturate(1.12) brightness(1.03)",
      }}
    >
      <Img
        src={staticFile("galassini/cover-frame.png")}
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
          "radial-gradient(ellipse 80% 60% at 50% 35%, rgba(0,0,0,0) 55%, rgba(30,8,10,0.35) 100%)",
      }}
    />

    {/* sticker */}
    <div
      style={{
        position: "absolute",
        right: 70,
        top: 290,
        transform: "rotate(8deg)",
        ...box(colors.red),
        color: colors.white,
        fontSize: 64,
        fontWeight: 800,
        letterSpacing: 3,
      }}
    >
      NOVITÀ
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
        Da oggi apri il tuo
      </div>
      <div
        style={{
          ...box(colors.red),
          fontSize: 116,
          whiteSpace: "nowrap",
          fontWeight: 800,
          lineHeight: 1.05,
          margin: "14px 0 10px",
          transform: "rotate(-2deg)",
        }}
      >
        CONTO CORRENTE
      </div>
      <div style={{ fontSize: 104, fontWeight: 800, lineHeight: 1.05 }}>
        in agenzia Generali
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
        4 MOTIVI PER SCEGLIERLO
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
