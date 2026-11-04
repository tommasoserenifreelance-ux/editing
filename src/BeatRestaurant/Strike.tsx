import { interpolate, random, useCurrentFrame } from "remotion";

// Hand-drawn marker line that sweeps left-to-right over a receipt row.
export const Strike: React.FC<{
  width: number;
  startFrame: number;
  drawFrames: number;
  seed: string;
}> = ({ width, startFrame, drawFrames, seed }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(
    frame,
    [startFrame, startFrame + drawFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  if (progress <= 0) return null;

  const r = (k: string) => random(`${seed}-${k}`);
  const pad = 14;
  const x0 = -8 - r("x0") * 6;
  const x1 = width + 6 + r("x1") * 22;
  const h = 40;
  const mid = h / 2;
  // Slight downward drift to the right, like a quick pen stroke.
  const y0 = mid - 2 + r("y0") * 3;
  const y1 = mid + 2 + r("y1") * 5;
  const steps = 7;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + (r(`w${i}`) - 0.5) * 2.4;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const d = `M ${pts[0]} L ${pts.slice(1).join(" L ")}`;
  // Second pass slightly offset gives the uneven felt-tip thickness.
  const d2 = `M ${x0 + 4},${y0 + 1.6} Q ${(x0 + x1) / 2},${mid + 3.5 + r("q") * 2} ${x1 - 10},${y1 + 0.8}`;

  return (
    <svg
      width={width + pad * 4}
      height={h}
      viewBox={`${-pad} 0 ${width + pad * 4} ${h}`}
      style={{
        position: "absolute",
        left: -pad,
        top: "50%",
        marginTop: -h / 2,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <g
        fill="none"
        stroke="#111"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.94}
      >
        <path
          d={d}
          pathLength={1}
          strokeWidth={9}
          strokeDasharray="1 1"
          strokeDashoffset={1 - progress}
        />
        <path
          d={d2}
          pathLength={1}
          strokeWidth={5}
          strokeDasharray="1 1"
          strokeDashoffset={1 - progress}
        />
      </g>
    </svg>
  );
};
