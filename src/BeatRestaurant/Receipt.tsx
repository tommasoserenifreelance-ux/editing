import { random, useVideoConfig } from "remotion";
import { mono } from "./fonts";
import { Strike } from "./Strike";
import type { BeatProps } from "./schema";

export const RECEIPT_W = 440;
const PAD_X = 34;
const BODY = 19;
const CHAR = 0.6; // JetBrains Mono advance width (em)
const INK = "#1b1b1b";

// Jagged torn-paper edge, deterministic per seed.
const tornPolygon = (seed: string) => {
  const n = 46;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 100;
    top.push(`${x.toFixed(2)}% ${(random(`${seed}t${i}`) * 9).toFixed(1)}px`);
    bottom.push(
      `${(100 - x).toFixed(2)}% calc(100% - ${(random(`${seed}b${i}`) * 9).toFixed(1)}px)`,
    );
  }
  return `polygon(${[...top, ...bottom].join(", ")})`;
};

const Dashes: React.FC = () => (
  <div
    style={{
      height: 0,
      borderTop: `2px dashed ${INK}`,
      opacity: 0.75,
      margin: "14px 0",
    }}
  />
);

const Row: React.FC<{ left: React.ReactNode; right?: React.ReactNode; style?: React.CSSProperties }> = ({
  left,
  right,
  style,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      ...style,
    }}
  >
    <span>{left}</span>
    <span>{right}</span>
  </div>
);

export const Receipt: React.FC<{ data: BeatProps; strikeFrames: number }> = ({
  data,
  strikeFrames,
}) => {
  const { fps } = useVideoConfig();
  const r = data.receipt;
  return (
    <div style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.35))" }}>
      <div
        style={{
          width: RECEIPT_W,
          clipPath: tornPolygon("beat"),
          background:
            "linear-gradient(172deg, #f7f7f4 0%, #ededea 38%, #f5f5f2 52%, #e6e6e2 100%)",
          color: INK,
          fontFamily: mono,
          fontSize: BODY,
          lineHeight: 1.45,
          padding: `44px ${PAD_X}px 40px`,
          position: "relative",
        }}
      >
        {/* paper creases */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, transparent 30%, rgba(0,0,0,0.05) 31%, transparent 34%), linear-gradient(64deg, transparent 62%, rgba(255,255,255,0.6) 63%, transparent 66%), linear-gradient(98deg, transparent 80%, rgba(0,0,0,0.04) 81%, transparent 85%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div
            style={{
              textAlign: "center",
              fontSize: 33,
              fontWeight: 700,
              letterSpacing: 0.5,
              lineHeight: 1.2,
            }}
          >
            {r.restaurant}
          </div>
          <div style={{ textAlign: "center", marginTop: 4 }}>{r.location}</div>
          <Dashes />
          <Row
            left={<b style={{ fontSize: 25, fontWeight: 700 }}>{r.tableLabel}</b>}
            right={r.orderLabel}
          />
          <Row left={r.coversLabel} right={r.date} />
          <Row left={r.serviceLabel} right={r.time} />
          <Dashes />
          {data.dishes.map((d, i) => {
            const [first, ...rest] = d.name.split("\n");
            return (
              <div
                key={i}
                style={{ display: "flex", margin: "10px 0" }}
              >
                <span style={{ width: BODY * CHAR * 3, flexShrink: 0 }}>
                  {d.qty}
                </span>
                <div>
                  <div style={{ position: "relative" }}>
                    {first}
                    <Strike
                      seed={`s${i}`}
                      width={first.length * BODY * CHAR}
                      startFrame={Math.round(d.strikeAt * fps)}
                      drawFrames={strikeFrames}
                    />
                  </div>
                  {rest.map((line, j) => (
                    <div key={j}>{line}</div>
                  ))}
                </div>
              </div>
            );
          })}
          <Dashes />
          <div style={{ fontWeight: 500 }}>{r.footerLine1}</div>
          <div style={{ fontWeight: 500 }}>{r.footerLine2}</div>
          <Dashes />
          <Row
            style={{ fontSize: 16 }}
            left={
              <>
                {r.printedLabel}
                <br />
                {r.printedDate}
              </>
            }
            right={r.orderShort}
          />
        </div>
      </div>
    </div>
  );
};
