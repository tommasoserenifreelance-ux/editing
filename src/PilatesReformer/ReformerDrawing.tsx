import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "./theme";

// Line drawing of a reformer that "draws itself" in.
export const ReformerDrawing: React.FC<{ delay?: number }> = ({
  delay = 0,
}) => {
  const frame = useCurrentFrame() - delay;
  const progress = interpolate(frame, [0, 45], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const carriage = interpolate(Math.sin(Math.max(0, frame - 45) / 14), [-1, 1], [0, 60]);

  const stroke = {
    fill: "none",
    stroke: colors.ink,
    strokeWidth: 6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    pathLength: 1,
    strokeDasharray: 1,
    strokeDashoffset: progress,
  };

  return (
    <svg width={760} height={260} viewBox="0 0 760 260">
      {/* frame */}
      <path d="M40 170 H720" {...stroke} />
      <path d="M70 170 V225 M690 170 V225" {...stroke} />
      {/* footbar */}
      <path d="M640 170 V80 H700" {...stroke} />
      {/* springs */}
      <path
        d="M420 150 l15 -14 l15 14 l15 -14 l15 14 l15 -14 l15 14 l15 -14 l15 14"
        {...stroke}
        stroke={colors.accent}
      />
      {/* carriage */}
      <g transform={`translate(${carriage} 0)`}>
        <rect x={120} y={124} width={260} height={34} rx={10} {...stroke} />
        <path d="M150 124 V96 M200 124 V96" {...stroke} />
      </g>
    </svg>
  );
};
