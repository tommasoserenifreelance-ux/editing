import { AbsoluteFill, Img, staticFile } from "remotion";
import { sans } from "../PilatesReformer/theme";

export const COVER_WIDTH = 1080;
export const COVER_HEIGHT = 1920;

const boxed: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 30px 12px",
  borderRadius: 16,
};

// 9:16 cover. Title and logo sit inside the 3:4 profile-grid crop.
export const ZanzaraCover: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Img
        src={staticFile("zanzara/cover-frame.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 25%, rgba(0,0,0,0) 45%)",
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 300,
          fontFamily: sans,
          fontWeight: 700,
          textAlign: "center",
          filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))",
        }}
      >
        <div
          style={{ fontSize: 62, lineHeight: 1.25, transform: "rotate(-2deg)" }}
        >
          <span style={{ ...boxed, background: "#000", color: "#fff" }}>
            LA MASCHERA MASKHIM
          </span>
        </div>
        <div
          style={{
            fontSize: 84,
            lineHeight: 1.1,
            marginTop: 12,
            transform: "rotate(-2deg)",
          }}
        >
          <span style={{ ...boxed, background: "#fff", color: "#000" }}>
            È ARRIVATA
            <br />
            ALLA ZANZARA
          </span>
        </div>
        <Img
          src={staticFile("zanzara/maskhim-logo.png")}
          style={{ width: 360, marginTop: 70 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
