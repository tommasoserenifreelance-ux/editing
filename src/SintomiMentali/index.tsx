import {
  AbsoluteFill,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  inter,
  pinkColors as colors,
  Signature,
} from "../EleonoraPiccolo/brand";

export const MENTALI_FPS = 30;
export const MENTALI_DURATION = 300; // 10 s, length of the background clip

const SYMPTOMS = [
  "Difficoltà a trovare le parole",
  "Vuoti di memoria a breve termine",
  "Nebbia mentale e poca concentrazione",
  "Perdere il filo a metà frase",
  "Dimenticare perché sei entrata in una stanza",
  "Difficoltà nel multitasking",
  "Una stanchezza mentale diversa dal solito",
  "Ansia o pensieri che corrono",
  "Poca concentrazione nei giorni del ciclo",
  "Difficoltà a prendere decisioni",
];

const shadow = "0 2px 12px rgba(0,0,0,0.6)";

export const SintomiMentali: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "black", fontFamily: inter }}>
      <OffthreadVideo
        src={staticFile("video/sole-alberi.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill style={{ backgroundColor: "rgba(40,20,35,0.4)" }} />
      <AbsoluteFill style={{ opacity, alignItems: "center", paddingTop: 300 }}>
        <div
          style={{
            width: 960,
            background: colors.pink,
            borderRadius: 18,
            padding: "44px 50px",
            textAlign: "center",
            color: colors.plum,
            fontSize: 66,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: -1.5,
            boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          }}
        >
          10 sintomi mentali che non sapevi fossero legati alla{" "}
          <span style={{ color: colors.rose }}>perimenopausa</span>
        </div>
        <div
          style={{
            marginTop: 70,
            width: 980,
            textAlign: "center",
            color: "#fff",
            fontSize: 40,
            fontWeight: 600,
            lineHeight: 1.6,
            textShadow: shadow,
          }}
        >
          {SYMPTOMS.map((symptom, i) => (
            <div key={symptom}>
              {i + 1}. {symptom}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Signature
        color="#fff"
        shadow={shadow}
        opacity={opacity}
        fontFamily={inter}
      />
    </AbsoluteFill>
  );
};
