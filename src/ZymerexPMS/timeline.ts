import { useCurrentFrame, useVideoConfig } from "remotion";

// Kept parts of the source (C9834 + C9834_1, seconds). The spoken question
// (0-5.1 s) is replaced by a silent blurred intro card; silences between the
// kept parts become jump cuts.
export const SEGMENTS: [number, number][] = [
  [5.1, 8.0],
  [8.13, 13.02],
  [13.1, 14.26],
  [14.56, 28.63],
  [28.81, 34.36],
  [34.63, 35.51],
  [36.04, 42.32],
];

/** Length of the blurred question card before the first segment (output seconds). */
export const INTRO = 2.8;

/** Topic changes get a zoom-blur transition (+ whoosh); index into SEGMENTS. */
export const TRANSITION_SEGMENTS = [1, 3, 4];

const OUT_STARTS: number[] = [];
{
  let acc = INTRO;
  for (const [a, b] of SEGMENTS) {
    OUT_STARTS.push(acc);
    acc += b - a;
  }
}
export const SEGMENT_OUT_STARTS = OUT_STARTS;

/** Output -> source. The intro maps onto the seconds just before the first cut. */
export const outToSrc = (out: number) => {
  if (out < INTRO) return SEGMENTS[0][0] - (INTRO - out);
  for (let i = SEGMENTS.length - 1; i >= 0; i--) {
    if (out >= OUT_STARTS[i]) {
      const [a, b] = SEGMENTS[i];
      const local = out - OUT_STARTS[i];
      return i === SEGMENTS.length - 1 ? a + local : Math.min(a + local, b);
    }
  }
  return out;
};

export const srcToOut = (src: number) => {
  for (let i = 0; i < SEGMENTS.length; i++) {
    const [a, b] = SEGMENTS[i];
    if (src < a) return OUT_STARTS[i];
    if (src <= b || i === SEGMENTS.length - 1) return OUT_STARTS[i] + (src - a);
  }
  return src;
};

export const useSrcSec = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return outToSrc(frame / fps);
};
