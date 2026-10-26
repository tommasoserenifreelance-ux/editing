import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { captionFont, colors, sans } from "./theme";
import { useToFrame } from "./timeline";

// ---------- timing helpers ----------

const DurContext = React.createContext(1);
const useDur = () => React.useContext(DurContext);
// Source time at which the current <At> slot starts.
const SlotContext = React.createContext(0);

// Places a graphic at `t` source seconds for `d` source seconds.
export const At: React.FC<{ t: number; d: number; children: React.ReactNode }> = ({
  t,
  d,
  children,
}) => {
  const toFrame = useToFrame();
  const from = Math.round(toFrame(t));
  const dur = Math.max(1, Math.round(toFrame(t + d)) - from);
  return (
    <Sequence from={from} durationInFrames={dur} layout="none">
      <DurContext.Provider value={dur}>
        <SlotContext.Provider value={t}>
          <AbsoluteFill>{children}</AbsoluteFill>
        </SlotContext.Provider>
      </DurContext.Provider>
    </Sequence>
  );
};

// Frames from the start of the current slot to source time `t`.
export const useSlotFrame = () => {
  const toFrame = useToFrame();
  const start = React.useContext(SlotContext);
  return (t: number) => Math.round(toFrame(t) - toFrame(start));
};

export type SfxName =
  | "pop"
  | "whoosh"
  | "swish"
  | "zap"
  | "hit"
  | "ding"
  | "beep"
  | "rise"
  | "fail"
  | "ring"
  | "shimmer"
  | "vroom";

// Effects must read clearly over the voice; the final mix goes through a limiter.
const SFX_GAIN = 1.5;

// `t` in source seconds; `raw` means it is already on the output timeline.
export const Sfx: React.FC<{
  t: number;
  name: SfxName;
  volume?: number;
  raw?: boolean;
  dur?: number; // cut the sound after this many seconds
}> = ({ t, name, volume = 0.6, raw = false, dur = 1 }) => {
  const toFrame = useToFrame();
  const { fps } = useVideoConfig();
  const from = Math.round(raw ? t * fps : toFrame(t));
  return (
    <Sequence from={from} durationInFrames={Math.round(dur * fps)} layout="none">
      <Audio
        src={staticFile(`elettromec/sfx/${name}.wav`)}
        volume={Math.min(1, volume * SFX_GAIN)}
      />
    </Sequence>
  );
};

// Spring in, quick fade/scale out at the end of the slot.
export const useInOut = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = useDur();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 180 },
  });
  const exit = interpolate(frame, [dur - 7, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { enter, exit, frame, fps };
};

const glow = (c: string) =>
  `drop-shadow(0 0 10px ${c}) drop-shadow(0 0 24px ${c}88)`;

// ---------- icons ----------

export const BoltIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = colors.yellow,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <path
      d="M38 2 L10 36 H28 L22 62 L54 24 H35 Z"
      fill={color}
      stroke={colors.navyDeep}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      d="M12 2C7.6 2 4 5.4 4 9.8 4 15.5 12 22 12 22s8-6.5 8-12.2C20 5.4 16.4 2 12 2z"
      fill={colors.yellow}
    />
    <circle cx={12} cy={10} r={3.2} fill={colors.navy} />
  </svg>
);

const CheckIcon: React.FC<{ size: number; color?: string }> = ({
  size,
  color = colors.yellow,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill={color} />
    <path
      d="M6.5 12.5 L10.5 16.5 L17.5 8.5"
      fill="none"
      stroke={colors.navyDeep}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrossIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={11} fill={colors.red} />
    <path
      d="M8 8 L16 16 M16 8 L8 16"
      stroke="white"
      strokeWidth={3}
      strokeLinecap="round"
    />
  </svg>
);

const CameraIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x={2} y={6} width={20} height={14} rx={3} fill="white" />
    <rect x={8} y={3} width={8} height={4} rx={1.5} fill="white" />
    <circle cx={12} cy={13} r={4.2} fill={colors.whatsapp} />
    <circle cx={12} cy={13} r={2.2} fill="white" />
  </svg>
);


const SnowIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100">
    {[0, 60, 120].map((r) => (
      <g key={r} transform={`rotate(${r})`} stroke="white" strokeWidth={7} strokeLinecap="round">
        <line x1={0} y1={-44} x2={0} y2={44} />
        <line x1={0} y1={-30} x2={-12} y2={-42} />
        <line x1={0} y1={-30} x2={12} y2={-42} />
        <line x1={0} y1={30} x2={-12} y2={42} />
        <line x1={0} y1={30} x2={12} y2={42} />
      </g>
    ))}
  </svg>
);

const icons = {
  pin: PinIcon,
  check: CheckIcon,
  bolt: BoltIcon,
} as const;

// ---------- graphics ----------

// Lightning bolt that slams in and flickers.
export const Bolt: React.FC<{ x: number; y: number; size?: number; rotate?: number }> = ({
  x,
  y,
  size = 220,
  rotate = -10,
}) => {
  const { enter, exit, frame } = useInOut();
  const flicker = frame < 10 ? (frame % 3 === 0 ? 0.35 : 1) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        opacity: exit * flicker,
        transform: `rotate(${rotate}deg) scale(${interpolate(enter, [0, 1], [2.2, 1])})`,
        filter: glow(colors.yellow),
      }}
    >
      <BoltIcon size={size} />
    </div>
  );
};

// Radial spark burst, used on brand mentions.
export const Sparks: React.FC<{ x: number; y: number; color?: string }> = ({
  x,
  y,
  color = colors.yellow,
}) => {
  const { frame } = useInOut();
  const p = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  return (
    <svg
      style={{ position: "absolute", left: x - 260, top: y - 260, filter: glow(color) }}
      width={520}
      height={520}
      viewBox="-260 -260 520 520"
    >
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.2;
        const r1 = 60 + p * 140;
        const r2 = r1 + 50 * (1 - p) + 10;
        return (
          <line
            key={i}
            x1={Math.cos(a) * r1}
            y1={Math.sin(a) * r1}
            x2={Math.cos(a) * r2}
            y2={Math.sin(a) * r2}
            stroke={color}
            strokeWidth={8 * (1 - p) + 1}
            strokeLinecap="round"
            opacity={1 - p * 0.9}
          />
        );
      })}
    </svg>
  );
};

const card: React.CSSProperties = {
  background: `linear-gradient(135deg, ${colors.navy}F2, ${colors.navyDeep}F2)`,
  border: `4px solid ${colors.yellow}`,
  borderRadius: 28,
  boxShadow: `8px 10px 0 ${colors.navyDeep}, 0 0 40px ${colors.yellow}55`,
  color: colors.white,
  fontFamily: sans,
};

// "CONSIGLIO #1"-style card that slides in from the left.

// Big centred title for hooks.

// WhatsApp-style message bubble with a camera icon.

// "CONSIGLIO #1"-style card that slides in from the left.
export const Badge: React.FC<{
  kicker: string;
  title: string;
  sub?: string;
  y?: number;
}> = ({ kicker, title, sub, y = 210 }) => {
  const { enter, exit } = useInOut();
  const subIn = useInOut(6).enter;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        top: y,
        opacity: exit,
        transform: `translateX(${interpolate(enter, [0, 1], [-700, 0])}px) rotate(-2deg)`,
      }}
    >
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 22, padding: "20px 34px 20px 22px" }}>
        <div style={{ filter: glow(colors.yellow) }}>
          <BoltIcon size={92} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 34, letterSpacing: 4, color: colors.yellow }}>
            {kicker}
          </div>
          <div style={{ fontWeight: 900, fontStyle: "italic", fontSize: 76, lineHeight: 1 }}>
            {title}
          </div>
        </div>
      </div>
      {sub && (
        <div
          style={{
            display: "inline-block",
            marginTop: 14,
            marginLeft: 30,
            padding: "10px 24px",
            borderRadius: 16,
            background: colors.yellow,
            color: colors.navyDeep,
            fontFamily: sans,
            fontWeight: 900,
            fontSize: 38,
            transform: `scale(${subIn})`,
            transformOrigin: "left center",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};


// Big centred title for hooks.
export const HeroTitle: React.FC<{ top: string; big: string; y?: number; icon?: "snow" | "bolt" }> = ({
  top,
  big,
  y = 330,
  icon = "bolt",
}) => {
  const { enter, exit, frame } = useInOut();
  const bigIn = useInOut(5).enter;
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: exit }}>
      <div style={{ position: "absolute", top: y, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            ...card,
            padding: "12px 34px",
            fontWeight: 800,
            fontSize: 42,
            letterSpacing: 3,
            transform: `scale(${enter}) rotate(-3deg)`,
          }}
        >
          {top}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, transform: `scale(${bigIn})` }}>
          <div
            style={{
              fontFamily: sans,
              fontWeight: 900,
              fontStyle: "italic",
              fontSize: 112,
              color: colors.yellow,
              WebkitTextStroke: `7px ${colors.navyDeep}`,
              paintOrder: "stroke fill",
              textShadow: `9px 10px 0 ${colors.navyDeep}`,
              lineHeight: 1,
            }}
          >
            {big}
          </div>
          <div style={{ transform: `rotate(${frame * 2}deg)`, filter: glow(colors.white) }}>
            {icon === "snow" ? <SnowIcon size={110} /> : <BoltIcon size={120} />}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};


// WhatsApp-style message bubble with a camera icon.
export const ChatBubble: React.FC<{ lines: string[]; y: number }> = ({ lines, y }) => {
  const { enter, exit } = useInOut();
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: exit }}>
      <div
        style={{
          position: "absolute",
          top: y,
          display: "flex",
          alignItems: "center",
          gap: 22,
          padding: "22px 34px 22px 24px",
          borderRadius: "34px 34px 34px 6px",
          background: colors.whatsapp,
          boxShadow: `8px 10px 0 ${colors.navyDeep}`,
          transform: `translateY(${interpolate(enter, [0, 1], [120, 0])}px) scale(${enter})`,
          fontFamily: sans,
          color: "white",
        }}
      >
        <div style={{ background: "rgba(0,0,0,0.18)", borderRadius: 20, padding: 12 }}>
          <CameraIcon size={86} />
        </div>
        <div style={{ fontWeight: 900, fontSize: 46, lineHeight: 1.1 }}>
          {lines.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Battery icon that drains (red) or charges (yellow) segment by segment.
export const Battery: React.FC<{ mode: "charge" | "drain"; x: number; y: number; size?: number }> = ({
  mode,
  x,
  y,
  size = 1,
}) => {
  const { enter, exit, frame, fps } = useInOut();
  const p = interpolate(frame, [8, 8 + fps * 1.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const level = mode === "charge" ? p : 1 - p;
  const segs = 5;
  const lit = Math.ceil(level * segs - 0.001);
  const fill = mode === "charge" ? colors.yellow : level < 0.3 ? colors.red : colors.yellow;
  const blink = mode === "drain" && level < 0.3 ? (Math.floor(frame / 5) % 2 ? 0.3 : 1) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: exit,
        transform: `scale(${enter * size}) rotate(6deg)`,
        filter: glow(fill),
      }}
    >
      <svg width={180} height={300} viewBox="0 0 180 300">
        <rect x={60} y={4} width={60} height={26} rx={6} fill="white" />
        <rect x={8} y={26} width={164} height={266} rx={24} fill={colors.navyDeep} stroke="white" strokeWidth={10} />
        {Array.from({ length: segs }).map((_, i) => (
          <rect
            key={i}
            x={26}
            y={248 - i * 48}
            width={128}
            height={36}
            rx={8}
            fill={fill}
            opacity={i < lit ? blink : 0.12}
          />
        ))}
        {mode === "charge" && (
          <g transform="translate(58 100) scale(1)">
            <BoltIcon size={64} color="white" />
          </g>
        )}
      </svg>
    </div>
  );
};

// Stack of labels that pop in one after another (item times in source seconds).
export const Chips: React.FC<{
  items: { label: string; t: number; big?: boolean }[];
  x?: number;
  y: number;
  icon?: keyof typeof icons;
  align?: "left" | "center";
}> = ({ items, x = 60, y, icon = "pin", align = "left" }) => {
  const { exit, frame, fps } = useInOut();
  const slotFrame = useSlotFrame();
  const Icon = icons[icon];
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: align === "left" ? x : 0,
        right: align === "center" ? 0 : undefined,
        display: "flex",
        flexDirection: "column",
        alignItems: align === "left" ? "flex-start" : "center",
        gap: 14,
        opacity: exit,
      }}
    >
      {items.map((it, i) => {
        const pop = spring({
          frame: frame - slotFrame(it.t),
          fps,
          config: { damping: 10, mass: 0.5, stiffness: 200 },
        });
        return (
          <div
            key={i}
            style={{
              ...card,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: it.big ? "14px 30px 14px 18px" : "10px 26px 10px 16px",
              fontWeight: 900,
              fontSize: it.big ? 64 : 42,
              border: `3px solid ${it.big ? colors.yellow : "rgba(255,255,255,0.35)"}`,
              color: it.big ? colors.yellow : colors.white,
              transform: `scale(${pop}) rotate(${i % 2 ? 1.5 : -1.5}deg)`,
              transformOrigin: "left center",
            }}
          >
            <Icon size={it.big ? 60 : 44} />
            {it.label}
          </div>
        );
      })}
    </div>
  );
};

// Countdown ring, e.g. "20 MIN".
export const TimerRing: React.FC<{ value: string; unit: string; x: number; y: number }> = ({
  value,
  unit,
  x,
  y,
}) => {
  const { enter, exit, frame, fps } = useInOut();
  const p = interpolate(frame, [6, 6 + fps * 1.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const r = 120;
  const c = 2 * Math.PI * r;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 150,
        top: y - 150,
        width: 300,
        height: 300,
        opacity: exit,
        transform: `scale(${enter})`,
      }}
    >
      <svg width={300} height={300} viewBox="-150 -150 300 300" style={{ position: "absolute", filter: glow(colors.yellow) }}>
        <circle r={r} fill={`${colors.navyDeep}E6`} stroke="rgba(255,255,255,0.2)" strokeWidth={22} />
        <circle
          r={r}
          fill="none"
          stroke={colors.yellow}
          strokeWidth={22}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          transform="rotate(-90)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          color: "white",
          lineHeight: 1,
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 104 }}>{value}</div>
        <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 4, color: colors.yellow }}>{unit}</div>
      </div>
    </div>
  );
};

// Pulsing emergency badge.
export const SosBadge: React.FC<{ x: number; y: number; label?: string }> = ({ x, y, label = "SOS" }) => {
  const { enter, exit, frame } = useInOut();
  const pulse = 1 + 0.06 * Math.sin(frame / 3);
  const ring = (frame % 24) / 24;
  return (
    <div style={{ position: "absolute", left: x - 140, top: y - 140, opacity: exit, transform: `scale(${enter * pulse})` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: `8px solid ${colors.red}`,
          transform: `scale(${1 + ring * 0.6})`,
          opacity: 1 - ring,
        }}
      />
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, #ff7676, ${colors.red} 55%, #b30000)`,
          border: "8px solid white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: sans,
          fontWeight: 900,
          fontSize: 96,
          color: "white",
          boxShadow: "0 0 50px rgba(255,59,59,0.7)",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Product name tag with a short spec line.
export const ProductTag: React.FC<{ name: string; sub: string; y?: number }> = ({ name, sub, y = 230 }) => {
  const { enter, exit } = useInOut();
  const subIn = useInOut(5).enter;
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: exit }}>
      <div style={{ position: "absolute", top: y, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            ...card,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 40px 14px 24px",
            transform: `scale(${enter}) rotate(-2deg)`,
          }}
        >
          <div style={{ filter: glow(colors.yellow) }}>
            <BoltIcon size={80} />
          </div>
          <div style={{ fontWeight: 900, fontStyle: "italic", fontSize: 92, color: colors.yellow, lineHeight: 1 }}>
            {name}
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            padding: "8px 24px",
            borderRadius: 14,
            background: "white",
            color: colors.navyDeep,
            fontFamily: sans,
            fontWeight: 900,
            fontSize: 38,
            transform: `scale(${subIn}) rotate(1.5deg)`,
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// "Rigenerare vs ricomprare" comparison.
export const VsCard: React.FC<{ good: string; bad: string; y: number }> = ({ good, bad, y }) => {
  const { enter, exit, frame, fps } = useInOut();
  const second = spring({ frame: frame - 8, fps, config: { damping: 12 } });
  const strike = interpolate(frame, [22, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const row = (text: string, ok: boolean, k: number): React.ReactNode => (
    <div
      style={{
        ...card,
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "14px 34px 14px 18px",
        fontWeight: 900,
        fontSize: ok ? 70 : 50,
        color: ok ? colors.yellow : "rgba(255,255,255,0.8)",
        border: `4px solid ${ok ? colors.yellow : colors.red}`,
        transform: `scale(${k}) rotate(${ok ? -2 : 2}deg)`,
      }}
    >
      {ok ? <CheckIcon size={70} /> : <CrossIcon size={52} />}
      {text}
      {!ok && (
        <div
          style={{
            position: "absolute",
            left: 90,
            top: "50%",
            height: 8,
            width: `calc(${strike * 100}% - 110px)`,
            background: colors.red,
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
  return (
    <AbsoluteFill style={{ alignItems: "center", opacity: exit }}>
      <div style={{ position: "absolute", top: y, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        {row(good, true, enter)}
        <div style={{ fontFamily: sans, fontWeight: 900, fontStyle: "italic", fontSize: 44, color: "white", textShadow: `3px 4px 0 ${colors.navyDeep}` }}>
          MEGLIO CHE
        </div>
        {row(bad, false, second)}
      </div>
    </AbsoluteFill>
  );
};

// Falling snow over the whole frame, fading in and out with the slot.
export const Snowfall: React.FC<{ count?: number }> = ({ count = 70 }) => {
  const { frame, fps } = useInOut();
  const dur = useDur();
  const fade = interpolate(frame, [0, 8, dur - 10, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Deterministic pseudo-random so every render matches.
  const rnd = (i: number, k: number) => {
    const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ opacity: fade, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const size = 6 + rnd(i, 1) * 16;
        const speed = 160 + rnd(i, 2) * 260; // px per second
        const y = ((rnd(i, 3) * 2200 + t * speed) % 2200) - 140;
        const x = rnd(i, 4) * 1080 + Math.sin(t * (0.8 + rnd(i, 5)) + i) * 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "white",
              opacity: 0.55 + rnd(i, 6) * 0.45,
              filter: size > 16 ? "blur(2px)" : undefined,
              boxShadow: "0 0 8px rgba(255,255,255,0.6)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- hero moment ----------

// White flash that burns out in a few frames.
export const Flash: React.FC<{ frames?: number }> = ({ frames = 9 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, frames], [1, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: "white", opacity: o }} />;
};

// Cinema bars sliding in from the top and bottom.
export const Letterbox: React.FC<{ size?: number }> = ({ size = 150 }) => {
  const { frame } = useInOut();
  const dur = useDur();
  const k = interpolate(frame, [0, 10, dur - 10, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bar: React.CSSProperties = { position: "absolute", left: 0, right: 0, height: size * k, background: "black" };
  return (
    <AbsoluteFill>
      <div style={{ ...bar, top: 0 }} />
      <div style={{ ...bar, bottom: 0 }} />
    </AbsoluteFill>
  );
};

// Comic-style speed lines radiating from a point, leaving the centre clear.
export const SpeedLines: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const { frame, exit } = useInOut();
  const appear = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0, opacity: appear * exit * 0.85 }}
    >
      {Array.from({ length: 48 }).map((_, i) => {
        const a = (i / 48) * Math.PI * 2 + frame * 0.004;
        const jitter = ((i * 37) % 11) / 11;
        const r1 = 430 + jitter * 160 + Math.sin(frame * 0.9 + i) * 30;
        const r2 = 1500;
        const w = 4 + (i % 3) * 4;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * r1}
            y1={y + Math.sin(a) * r1}
            x2={x + Math.cos(a) * r2}
            y2={y + Math.sin(a) * r2}
            stroke={i % 4 === 0 ? colors.yellow : "white"}
            strokeWidth={w}
            strokeLinecap="round"
            opacity={0.55 + jitter * 0.45}
          />
        );
      })}
    </svg>
  );
};

// Four-point star glint, like light catching the lenses.
export const Glint: React.FC<{ x: number; y: number; size?: number; delay?: number }> = ({
  x,
  y,
  size = 220,
  delay = 0,
}) => {
  const frame = useCurrentFrame() - delay;
  const k = interpolate(frame, [0, 5, 14], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        transform: `scale(${k}) rotate(${frame * 6}deg)`,
        filter: glow(colors.yellow),
      }}
    >
      <path d="M0 -50 L7 -7 L50 0 L7 7 L0 50 L-7 7 L-50 0 L-7 -7 Z" fill="white" />
      <circle r={8} fill="white" />
    </svg>
  );
};

// Film-style name card for the hero.
export const HeroName: React.FC<{ name: string; role: string; y: number }> = ({ name, role, y }) => {
  const { frame, fps, exit } = useInOut();
  const line = spring({ frame, fps, config: { damping: 20 } });
  const nameIn = spring({ frame: frame - 4, fps, config: { damping: 14, mass: 0.6 } });
  const roleIn = spring({ frame: frame - 9, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", left: 90, top: y, opacity: exit }}>
      <div style={{ width: 520 * line, height: 8, background: colors.yellow, boxShadow: `0 0 20px ${colors.yellow}` }} />
      <div
        style={{
          marginTop: 18,
          fontFamily: captionFont,
          fontWeight: 800,
          fontSize: 190,
          lineHeight: 0.95,
          color: "white",
          letterSpacing: interpolate(nameIn, [0, 1], [40, 4]),
          opacity: nameIn,
          transform: `translateX(${interpolate(nameIn, [0, 1], [-120, 0])}px)`,
          textShadow: "0 8px 30px rgba(0,0,0,0.6)",
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 10,
          fontFamily: captionFont,
          fontWeight: 800,
          fontSize: 54,
          letterSpacing: interpolate(roleIn, [0, 1], [30, 10]),
          color: colors.yellow,
          opacity: roleIn,
          textShadow: "0 4px 18px rgba(0,0,0,0.7)",
        }}
      >
        {role}
      </div>
    </div>
  );
};

// Small tilted sticker for comic beats.
export const Sticker: React.FC<{ text: string; x: number; y: number; color?: string; rotate?: number }> = ({
  text,
  x,
  y,
  color = colors.yellow,
  rotate = -8,
}) => {
  const { enter, exit } = useInOut();
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: exit,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${interpolate(enter, [0, 1], [2, 1])})`,
        padding: "12px 30px",
        borderRadius: 22,
        background: color,
        color: colors.navyDeep,
        fontFamily: sans,
        fontWeight: 900,
        fontStyle: "italic",
        fontSize: 72,
        border: `5px solid ${colors.navyDeep}`,
        boxShadow: `8px 9px 0 ${colors.navyDeep}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// Small logo in the bottom centre of the footage.
export const Watermark: React.FC = () => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
    <Img
      src={staticFile("elettromec/brand/atom-white.png")}
      style={{
        width: 110,
        marginBottom: 70,
        opacity: 0.9,
        filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.6))",
      }}
    />
  </AbsoluteFill>
);

// Closing card appended after the footage: white logo and tagline on black.
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 10, mass: 0.7 } });
  const word = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const flash = interpolate(frame, [0, 6], [0.8, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "black",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Img
        src={staticFile("elettromec/brand/atom-white.png")}
        style={{
          width: 520,
          transform: `scale(${interpolate(enter, [0, 1], [0.3, 1])}) rotate(${interpolate(enter, [0, 1], [-120, 0]) + frame * 0.4}deg)`,
        }}
      />
      <div
        style={{
          marginTop: 50,
          fontFamily: captionFont,
          fontWeight: 800,
          fontSize: 64,
          color: "white",
          lineHeight: 1,
          opacity: word,
          transform: `translateY(${interpolate(word, [0, 1], [40, 0])}px)`,
        }}
      >
        Se funziona, è Elettromec
      </div>
      <AbsoluteFill style={{ background: "white", opacity: flash }} />
    </AbsoluteFill>
  );
};
