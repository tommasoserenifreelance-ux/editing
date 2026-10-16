import { AbsoluteFill, Img, staticFile } from "remotion";
import { sans } from "../PilatesReformer/theme";

// Reel cover: a frame of the video with the stickers from the edit as title.
// Text stays inside the centre 3:4 area so the profile grid crop keeps it.

const pill: React.CSSProperties = {
  display: "inline-block",
  borderRadius: 999,
  color: "#1F1F1F",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

export const Cover: React.FC<{ image: string }> = ({ image }) => (
  <AbsoluteFill style={{ backgroundColor: "black", fontFamily: sans }}>
    <Img
      src={staticFile(`cover/${image}`)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 88%)",
      }}
    />
    <AbsoluteFill style={{ alignItems: "flex-end", padding: "250px 80px 0 0" }}>
      <Img
        src={staticFile("logo.png")}
        style={{
          width: 120,
          opacity: 0.85,
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
        }}
      />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 290,
      }}
    >
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
            fontSize: 84,
            padding: "14px 54px",
          }}
        >
          <span style={{ fontWeight: 700 }}>Sfatiamo</span>{" "}
          <span style={{ fontWeight: 400 }}>i</span>
        </div>
        <div
          style={{
            ...pill,
            background: "#D9C4F1",
            fontSize: 132,
            fontWeight: 700,
            padding: "10px 64px",
            marginTop: -8,
            letterSpacing: 1,
          }}
        >
          FALSI MITI
        </div>
        <div
          style={{
            ...pill,
            background: "#FF3B3B",
            color: "white",
            fontSize: 70,
            fontWeight: 700,
            padding: "12px 48px",
            marginTop: -6,
            transform: "rotate(4deg)",
          }}
        >
          sul collagene ✗
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
