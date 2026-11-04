import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { useSrcSec } from "./timeline";
import { Icon, IconName } from "./Icons";
import { C, font } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Seconds since `from` (can be negative). */
// All overlay times are authored in source-clip seconds; the edit removes
// silences, so time is read through the cut map.
export const useT = (from: number) => useSrcSec() - from;

/** Spring that starts at `from` seconds; returns 0..1 (with overshoot). */
// Smooth, no-overshoot ease (kept signature so callers can stay unchanged).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const usePop = (from: number, _damping = 0, _mass = 0) => {
  const { fps } = useVideoConfig();
  const src = useSrcSec();
  return spring({ frame: (src - from) * fps, fps, config: { damping: 24, stiffness: 240, mass: 0.8, overshootClamping: true } });
};

/** 1 while visible, fades to 0 over the last `fade` seconds before `to`. */
export const useOut = (to: number, fade = 0.22) => {
  const t = useT(0);
  return interpolate(t, [to - fade, to], [1, 0], clamp);
};

export const Visible: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({
  from,
  to,
  children,
}) => {
  const t = useT(0);
  if (t < from - 0.05 || t > to + 0.05) return null;
  return <>{children}</>;
};

/** Gradient disc with a draw-on icon. */
export const IconDisc: React.FC<{
  name: IconName;
  size: number;
  from: number;
  bg?: string;
  draw?: number;
}> = ({ name, size, from, bg, draw = 0.7 }) => {
  const solid = bg !== undefined;
  const t = useT(from);
  const pop = usePop(from, 11);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: solid ? bg : C.tint,
        border: solid ? "none" : `2px solid rgba(0,93,160,0.18)`,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`,
        opacity: pop,
        flexShrink: 0,
      }}
    >
      <Icon name={name} size={size * 0.56} color={solid ? "#fff" : C.blue} progress={interpolate(t, [0.05, 0.05 + draw], [0, 1], clamp)} />
    </div>
  );
};

/** Animated check / cross stamp. */
export const Stamp: React.FC<{ kind: "check" | "cross"; from: number; size: number }> = ({
  kind,
  from,
  size,
}) => {
  const t = useT(from);
  const pop = usePop(from, 9, 0.5);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: kind === "check" ? C.blue : C.navy,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])})`,
        opacity: pop,
        flexShrink: 0,
      }}
    >
      <Icon name={kind} size={size * 0.6} stroke={6} progress={interpolate(t, [0.05, 0.35], [0, 1], clamp)} />
    </div>
  );
};

export const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.97)",
  borderRadius: 28,
  boxShadow: "0 18px 44px rgba(0,30,70,0.22)",
  fontFamily: font,
  color: C.navy,
};

/** Top-of-frame title pill (reference: numbered/emoji pills above the head). */
export const TopPill: React.FC<{
  from: number;
  to: number;
  text: string;
  icon?: IconName;
  children?: React.ReactNode;
}> = ({ from, to, text, icon, children }) => {
  const pop = usePop(from, 13);
  const out = useOut(to);
  return (
    <Visible from={from} to={to}>
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: Math.min(1, pop * 2) * out,
          transform: `translateY(${interpolate(pop, [0, 1], [-24, 0])}px) scale(${interpolate(pop, [0, 1], [0.96, 1])})`,
        }}
      >
        <div
          style={{
            ...cardStyle,
            borderRadius: 100,
            padding: icon ? "14px 40px 14px 14px" : "22px 44px",
            display: "flex",
            alignItems: "center",
            gap: 22,
            fontSize: 50,
            fontWeight: 900,
            letterSpacing: 1,
          }}
        >
          {icon ? <IconDisc name={icon} size={92} from={from + 0.05} /> : null}
          <span>{text}</span>
          {children}
        </div>
      </div>
    </Visible>
  );
};

/** Container placed over the chest, centred at y. */
export const Slot: React.FC<{
  from: number;
  to: number;
  y?: number;
  children: React.ReactNode;
}> = ({ from, to, y = 1010, children }) => {
  const pop = usePop(from, 14);
  const out = useOut(to);
  return (
    <Visible from={from} to={to}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: y,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 0,
          opacity: Math.min(1, pop * 2) * out,
          transform: `scale(${interpolate(pop, [0, 1], [0.95, 1]) * interpolate(out, [0, 1], [0.92, 1])})`,
        }}
      >
        {children}
      </div>
    </Visible>
  );
};

/** A row that slides in at `from`. */
export const Row: React.FC<{ from: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  from,
  children,
  style,
}) => {
  const pop = usePop(from, 14);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        opacity: Math.min(1, pop * 1.5),
        transform: `translateX(${interpolate(pop, [0, 1], [-30, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
