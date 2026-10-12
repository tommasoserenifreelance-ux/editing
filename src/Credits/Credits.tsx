import { useLayoutEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  continueRender,
  delayRender,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { credits } from "./data";
import { FONT_FAMILY } from "./font";

export const creditsSchema = z.object({
  accentColor: zColor(),
});

const HEADER_HEIGHT = 270;
const SCROLL_START = 20;
const HOLD_FRAMES = 30;
const FADE_OUT_FRAMES = 15;
// Where the last block (the note) comes to rest, measured from the top.
const REST_CENTER_Y = 680;

const Heading: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => (
  <div
    style={{
      color,
      fontWeight: 700,
      fontSize: 24,
      letterSpacing: 8,
      textTransform: "uppercase",
      textAlign: "center",
      marginTop: 110,
      marginBottom: 36,
    }}
  >
    {text}
  </div>
);

export const Credits: React.FC<z.infer<typeof creditsSchema>> = ({
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const noteRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ noteCenter: number } | null>(null);
  const [handle] = useState(() => delayRender("Measuring credits"));

  useLayoutEffect(() => {
    document.fonts.ready.then(() => {
      const note = noteRef.current;
      if (note) {
        setLayout({ noteCenter: note.offsetTop + note.offsetHeight / 2 });
      }
      continueRender(handle);
    });
  }, [handle]);

  const scrollEnd = durationInFrames - HOLD_FRAMES - FADE_OUT_FRAMES;
  const endY = layout ? REST_CENTER_Y - layout.noteCenter : 0;
  const y = interpolate(frame, [SCROLL_START, scrollEnd], [height, endY], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0, 0.6, 1),
  });

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const logoY = interpolate(frame, [0, 20], [-12, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - FADE_OUT_FRAMES, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        fontFamily: FONT_FAMILY,
        color: "#fff",
      }}
    >
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Scrolling credits, faded out under the header and at the bottom edge */}
        <AbsoluteFill
          style={{
            maskImage: `linear-gradient(to bottom, transparent ${HEADER_HEIGHT - 30}px, #000 ${HEADER_HEIGHT + 90}px, #000 ${height - 120}px, transparent ${height - 20}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width,
              transform: `translateY(${y}px)`,
              visibility: layout ? "visible" : "hidden",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                fontSize: 76,
                letterSpacing: 10,
                textAlign: "center",
              }}
            >
              {credits.product}
            </div>
            <div
              style={{
                width: 80,
                height: 3,
                backgroundColor: accentColor,
                margin: "28px auto",
              }}
            />
            <div
              style={{
                fontWeight: 300,
                fontSize: 32,
                textAlign: "center",
                padding: "0 120px",
                lineHeight: 1.35,
              }}
            >
              {credits.subtitle}
            </div>

            <Heading text={credits.resultsHeading} color={accentColor} />
            {credits.results.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  fontSize: 30,
                  lineHeight: "64px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    textAlign: "right",
                    paddingRight: 24,
                    fontWeight: 300,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "left",
                    paddingLeft: 24,
                    fontWeight: 700,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}

            <Heading text={credits.activitiesHeading} color={accentColor} />
            {credits.activities.map((item) => (
              <div
                key={item}
                style={{
                  fontWeight: 500,
                  fontSize: 30,
                  lineHeight: "58px",
                  textAlign: "center",
                }}
              >
                {item}
              </div>
            ))}

            <div
              ref={noteRef}
              style={{
                marginTop: 110,
                padding: "0 150px",
                fontWeight: 300,
                fontSize: 27,
                lineHeight: 1.5,
                textAlign: "center",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              <span style={{ color: accentColor, fontWeight: 700 }}>* </span>
              {credits.note}
            </div>
          </div>
        </AbsoluteFill>

        {/* Fixed header with the logo */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 0,
            width,
            display: "flex",
            justifyContent: "center",
            opacity: logoOpacity,
            transform: `translateY(${logoY}px)`,
          }}
        >
          <Img src={staticFile("ramatex-logo.png")} style={{ width: 400 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
