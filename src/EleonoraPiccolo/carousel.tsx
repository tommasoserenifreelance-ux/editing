import { AbsoluteFill, Img, staticFile } from "remotion";
import { inter, pinkColors as colors, Signature } from "./brand";

// Instagram carousel, 4:5.
export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;

const FADE_EDGES =
  "linear-gradient(to right, transparent, black 25%, black 75%, transparent), linear-gradient(black 85%, transparent)";

export type Theme = { bg: string; title: string; text: string; accent: string };

export const LIGHT: Theme = {
  bg: colors.pink,
  title: colors.plum,
  text: colors.navy,
  accent: colors.rose,
};
// Text over a darkened photo.
export const PHOTO: Theme = {
  bg: colors.plum,
  title: "#fff",
  text: "#fff",
  accent: "#F6C1CC",
};

// `bare` shows the photo without overlay, at `photoWidth` px wide from the top
// with its edges faded into the theme background, and the text at the bottom.
// Meant for photos of a subject on a plain background.
export const Frame: React.FC<{
  theme: Theme;
  photo?: string;
  bare?: boolean;
  photoWidth?: number;
  children: React.ReactNode;
}> = ({ theme, photo, bare, photoWidth = SLIDE_WIDTH, children }) => (
  <AbsoluteFill
    style={{
      background: theme.bg,
      fontFamily: inter,
      color: theme.text,
      justifyContent: bare ? "flex-end" : "center",
      padding: bare ? "0 100px 170px" : "0 100px 80px",
      textShadow: photo && !bare ? "0 2px 14px rgba(0,0,0,0.45)" : undefined,
    }}
  >
    {photo ? (
      <>
        <Img
          src={staticFile(`img/${photo}`)}
          style={
            bare
              ? {
                  position: "absolute",
                  top: 0,
                  left: (SLIDE_WIDTH - photoWidth) / 2,
                  width: photoWidth,
                  WebkitMaskImage: FADE_EDGES,
                  WebkitMaskComposite: "source-in",
                }
              : {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }
          }
        />
        {bare ? null : (
          <AbsoluteFill
            style={{
              background:
                "linear-gradient(rgba(40,20,35,0.35), rgba(40,20,35,0.6))",
            }}
          />
        )}
      </>
    ) : null}
    <div style={{ position: "relative" }}>{children}</div>
    <Signature color={theme.title} fontFamily={inter} bottom={70} />
  </AbsoluteFill>
);

export const Title: React.FC<{
  theme: Theme;
  size?: number;
  children: React.ReactNode;
}> = ({ theme, size = 78, children }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.08,
      letterSpacing: -1.5,
      textTransform: "uppercase",
      color: theme.title,
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{ size?: number; children: React.ReactNode }> = ({
  size = 40,
  children,
}) => (
  <div
    style={{ fontSize: size, fontWeight: 400, lineHeight: 1.45, marginTop: 44 }}
  >
    {children}
  </div>
);

export const Accent: React.FC<{ theme: Theme; children: React.ReactNode }> = ({
  theme,
  children,
}) => <span style={{ color: theme.accent }}>{children}</span>;

export const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "inline-block",
      background: colors.plum,
      color: colors.pink,
      fontSize: 34,
      fontWeight: 600,
      padding: "16px 28px",
      borderRadius: 14,
      margin: "0 14px 18px 0",
    }}
  >
    {children}
  </div>
);

export type SlideDef = {
  theme: Theme;
  photo?: string;
  bare?: boolean;
  photoWidth?: number;
  render: (t: Theme) => React.ReactNode;
};
