import { AbsoluteFill, Img, staticFile } from "remotion";
import { DISPLAY_FONT, LIGHT_FONT } from "./fonts";

const SHADOW =
  "0 3px 10px rgba(0,0,0,0.7), 0 0 28px rgba(0,0,0,0.45), 0 0 2px rgba(0,0,0,0.9)";

// 9:16 reel cover. The text stays inside the central 3:4 area
// (y 240-1680) so it survives the profile-grid crop.
export const Cover: React.FC<{
  frameSrc: string;
  titleTop: string;
  titleBottom: string;
  subtitle: string;
}> = ({ frameSrc, titleTop, titleBottom, subtitle }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Img src={staticFile(frameSrc)} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 62%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0) 92%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 1060,
          width: "100%",
          textAlign: "center",
          textTransform: "uppercase",
          textShadow: SHADOW,
        }}
      >
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: 132,
            lineHeight: 0.98,
            color: "#F7EDCF",
          }}
        >
          <div>{titleTop}</div>
          <div style={{ fontSize: 150, lineHeight: 0.9, color: "white" }}>
            &gt;
          </div>
          <div>{titleBottom}</div>
        </div>
        <div
          style={{
            fontFamily: LIGHT_FONT,
            fontWeight: 300,
            fontSize: 58,
            marginTop: 22,
            color: "white",
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
