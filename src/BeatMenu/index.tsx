import {
  AbsoluteFill,
  Easing,
  interpolate,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";

// Split-screen "menu" reel modelled on the sixth reference: top half a finger
// running down the menu (beat.ref.6, slowed with motion-interpolated frames so
// it stays smooth), bottom half the dish photos changing on the reference's
// beats, each photo shown once. 30 fps like the reference, reference music.
export const MENU_FPS = 30;

// Bottom-half cuts follow the reference (frames 15, 23, 34, 56, 78, 98, 111,
// 123, 136, 175, 188); the reference's 15 segments are merged to 12 so that
// no dish repeats.
const DISHES: { img: string; frames: number }[] = [
  { img: "01", frames: 15 },
  { img: "04", frames: 8 },
  { img: "02", frames: 11 },
  { img: "05", frames: 22 },
  { img: "03", frames: 22 },
  { img: "07", frames: 20 },
  { img: "06", frames: 13 },
  { img: "09", frames: 12 },
  { img: "08", frames: 13 },
  { img: "10", frames: 39 },
  { img: "12", frames: 13 },
  { img: "11", frames: 26 },
];
const starts = DISHES.reduce<number[]>(
  (acc, d, i) => [...acc, i === 0 ? 0 : acc[i - 1] + DISHES[i - 1].frames],
  [],
);
export const MENU_DURATION =
  starts[starts.length - 1] + DISHES[DISHES.length - 1].frames; // 214

const half = (top: boolean): React.CSSProperties => ({
  position: "absolute",
  left: 0,
  top: top ? 0 : 960,
  width: 1080,
  height: 960,
  overflow: "hidden",
});

// Zoomed on the menu: the clip fills the width and the frame glides down the
// page with the finger, so the line being pointed at stays readable.
const MenuZoom: React.FC = () => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, MENU_DURATION - 1], [20, 88], {
    easing: Easing.inOut(Easing.quad),
  });
  return (
    <OffthreadVideo
      src={staticFile("beat/menu/menu_yellow.mp4")}
      muted
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: `50% ${y}%`,
        // slight zoom so the cover's yellow edge never shows at the start
        transform: "scale(1.06)",
      }}
    />
  );
};

export const BeatMenu: React.FC = () => (
  <AbsoluteFill style={{ background: "black" }}>
    <div style={half(true)}>
      <MenuZoom />
    </div>
    <div style={half(false)}>
      {DISHES.map((d, i) => (
        <Sequence key={i} from={starts[i]} durationInFrames={d.frames}>
          <Img
            src={staticFile(`beat/menu/dishes/${d.img}.jpg`)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // the yellow disc has a radius of ~700 px: zoom so the black
              // corners outside it never show
              transform: "scale(1.08)",
            }}
          />
        </Sequence>
      ))}
    </div>
    <Audio src={staticFile("beat/menu/ref-audio.m4a")} />
  </AbsoluteFill>
);
