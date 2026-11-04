import React from "react";
import { AbsoluteFill } from "remotion";
import { IconName } from "./Icons";
import { C, font } from "./theme";
import { IconDisc } from "./ui";

const ITEMS: [IconName, string][] = [
  ["intestine", "Intestino"],
  ["bolt", "Dolore"],
  ["belly", "Gonfiore"],
  ["hourglass", "Stitichezza"],
  ["drop", "Diarrea"],
  ["timer", "30 secondi"],
  ["person", "Persona"],
  ["plate", "Dieta / pasti"],
  ["lotus", "Stress"],
  ["clock", "Pasti regolari"],
  ["wheat", "Fibre"],
  ["energy", "Acido butirrico"],
  ["flower", "Malva"],
  ["leaf", "Menta"],
  ["daisy", "Partenio"],
  ["bacteria", "Probiotici"],
  ["pill", "Compresse"],
  ["brain", "Testa"],
  ["check", "Check"],
  ["arrow", "Nuovo nome"],
];

// Contact sheet of every icon, for client approval.
export const IconSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "white", fontFamily: font, padding: 60 }}>
    <div style={{ fontSize: 56, fontWeight: 900, color: C.navy, marginBottom: 40 }}>Icone Zymerex</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", rowGap: 50 }}>
      {ITEMS.map(([n, l]) => (
        <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <IconDisc name={n} size={170} from={-5} />
          <span style={{ fontSize: 30, fontWeight: 700, color: C.navy }}>{l}</span>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", gap: 40, marginTop: 70, justifyContent: "center" }}>
      <IconDisc name="energy" size={170} from={-5} bg={C.blue} />
      <IconDisc name="leaf" size={170} from={-5} bg={C.blue} />
      <span style={{ fontSize: 30, fontWeight: 700, color: C.navy, alignSelf: "center" }}>variante piena</span>
    </div>
  </AbsoluteFill>
);
