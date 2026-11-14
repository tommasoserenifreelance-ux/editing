import { AbsoluteFill, Img, staticFile } from "remotion";
import { inter, pinkColors as colors, Signature } from "./brand";

// Instagram carousel, 4:5.
export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;

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

// `bare` shows the photo without the dark overlay, fading into the theme
// background behind the text. Meant for photos of a subject on a plain
// backdrop. By default the photo fills the slide from the top and the text sits
// at the bottom; with `textTop` the photo spans the width at the bottom and the
// text sits in the space above it.
const barePhotoStyle = (textTop: boolean): React.CSSProperties =>
  textTop
    ? { position: "absolute", left: 0, bottom: 0, width: "100%" }
    : {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "top",
      };

export const Frame: React.FC<{
  theme: Theme;
  photo?: string;
  bare?: boolean;
  textTop?: boolean;
  children: React.ReactNode;
}> = ({ theme, photo, bare, textTop = false, children }) => (
  <AbsoluteFill
    style={{
      background: theme.bg,
      fontFamily: inter,
      color: theme.text,
      justifyContent: !bare ? "center" : textTop ? "flex-start" : "flex-end",
      padding: !bare
        ? "0 100px 80px"
        : textTop
          ? "80px 100px 0"
          : "0 100px 170px",
      textShadow: photo && !bare ? "0 2px 14px rgba(0,0,0,0.45)" : undefined,
    }}
  >
    {photo ? (
      <>
        <Img
          src={staticFile(`img/${photo}`)}
          style={
            bare
              ? barePhotoStyle(textTop)
              : {
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }
          }
        />
        <AbsoluteFill
          style={{
            background: !bare
              ? "linear-gradient(rgba(40,20,35,0.35), rgba(40,20,35,0.6))"
              : textTop
                ? `linear-gradient(${theme.bg} 15%, transparent 35%)`
                : `linear-gradient(transparent 50%, ${theme.bg} 80%)`,
          }}
        />
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

export const Point: React.FC<{ theme: Theme; title: string; text: string }> = ({
  theme,
  title,
  text,
}) => (
  <div style={{ marginTop: 40 }}>
    <div style={{ fontSize: 40, fontWeight: 700, color: theme.accent }}>
      {title}
    </div>
    <div style={{ fontSize: 33, lineHeight: 1.4, marginTop: 8 }}>{text}</div>
  </div>
);

export const BigNumber: React.FC<{
  theme: Theme;
  children: React.ReactNode;
}> = ({ theme, children }) => (
  <div
    style={{
      fontSize: 150,
      fontWeight: 700,
      letterSpacing: -5,
      lineHeight: 1,
      color: theme.accent,
      marginTop: 50,
    }}
  >
    {children}
  </div>
);

// A screenshot of the study, as a white card.
export const StudyCard: React.FC<{ src: string }> = ({ src }) => (
  <Img
    src={staticFile(`img/${src}`)}
    style={{
      marginTop: 50,
      width: "100%",
      background: "#fff",
      padding: 24,
      borderRadius: 18,
      boxShadow: "0 12px 40px rgba(110,63,99,0.18)",
    }}
  />
);

export type SlideDef = {
  theme: Theme;
  photo?: string;
  bare?: boolean;
  textTop?: boolean;
  render: (t: Theme) => React.ReactNode;
};
