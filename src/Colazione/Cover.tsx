import { AbsoluteFill, Img, staticFile } from "remotion";
import { sans } from "../PilatesReformer/theme";

// Reel cover for "Una colazione anti fame": the frame where she laughs with
// a blueberry (public/cover/colazione.png, colazione.mp4 at 46.5 s), the
// same pill stickers as the video hook on the empty wall above her head, and
// the totals on the table. Everything inside the centre 3:4 area kept by
// the profile grid, clear of her face.

const pill: React.CSSProperties = {
  display: "inline-block",
  borderRadius: 999,
  color: "#1F1F1F",
  fontFamily: sans,
  fontWeight: 700,
  whiteSpace: "nowrap",
  boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
};

export const ColazioneCover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Img
      src={staticFile("cover/colazione.png")}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 245 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: "rotate(-3deg)",
        }}
      >
        <div
          style={{
            ...pill,
            background: "#EEF7A3",
            fontSize: 68,
            padding: "12px 52px",
          }}
        >
          Una colazione
        </div>
        <div
          style={{
            ...pill,
            background: "#D9C4F1",
            fontSize: 108,
            padding: "8px 60px",
            marginTop: -8,
            letterSpacing: 1,
          }}
        >
          ANTI FAME
        </div>
      </div>
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 290,
      }}
    >
      <div
        style={{
          ...pill,
          background: "white",
          fontSize: 50,
          padding: "14px 44px",
          transform: "rotate(2deg)",
        }}
      >
        24 g proteine · 7 g fibre
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
