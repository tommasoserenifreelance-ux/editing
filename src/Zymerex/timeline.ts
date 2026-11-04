import { useCurrentFrame, useVideoConfig } from "remotion";

// Kept parts of the source clip (seconds). Silences between them, found with
// ffmpeg silencedetect (-30 dB, >=120 ms), are cut out as jump cuts.
export const SEGMENTS: [number, number][] = [
  [0.0, 8.411],
  [8.511, 11.814],
  [12.263, 18.228],
  [18.554, 21.074],
  [21.276, 22.573],
  [22.741, 24.66],
  [25.016, 27.969],
  [28.214, 30.178],
  [30.375, 33.923],
  [34.338, 35.589],
  [35.761, 40.276],
  [40.38, 43.262],
  [43.359, 46.011],
  [46.187, 48.997],
  [49.476, 54.892],
  [55.393, 58.458],
];

/** Section changes get a zoom-blur transition (+ whoosh); index into SEGMENTS. */
export const TRANSITION_SEGMENTS = [2, 3, 6, 7, 10, 14, 15];

const OUT_STARTS: number[] = [];
{
  let acc = 0;
  for (const [a, b] of SEGMENTS) {
    OUT_STARTS.push(acc);
    acc += b - a;
  }
}

export const EDIT_SECONDS = SEGMENTS.reduce((s, [a, b]) => s + b - a, 0);
export const SEGMENT_OUT_STARTS = OUT_STARTS;

/** Output time -> source time. Past the end it keeps running linearly. */
export const outToSrc = (out: number) => {
  for (let i = SEGMENTS.length - 1; i >= 0; i--) {
    if (out >= OUT_STARTS[i]) {
      const [a, b] = SEGMENTS[i];
      const local = out - OUT_STARTS[i];
      return i === SEGMENTS.length - 1 ? a + local : Math.min(a + local, b);
    }
  }
  return out;
};

/** Source time -> output time (times inside a cut snap to the next kept part). */
export const srcToOut = (src: number) => {
  for (let i = 0; i < SEGMENTS.length; i++) {
    const [a, b] = SEGMENTS[i];
    if (src < a) return OUT_STARTS[i];
    if (src <= b || i === SEGMENTS.length - 1) return OUT_STARTS[i] + (src - a);
  }
  return src;
};

/** Current time expressed in source-clip seconds (all overlays are authored in it). */
export const useSrcSec = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return outToSrc(frame / fps);
};
