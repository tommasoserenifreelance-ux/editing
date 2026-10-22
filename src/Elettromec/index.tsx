import React from "react";
import { Composition, Folder } from "remotion";
import { durationOf, ElettromecVideo, VideoSpec } from "./ElettromecVideo";
import { FPS } from "./theme";
import { video1, video2, video3, video4, video5 } from "./videos";

// Specs hold React overlays, which can't go through serialisable props,
// so each video gets its own prop-less component.
const make = (spec: VideoSpec): [VideoSpec, React.FC] => [
  spec,
  () => <ElettromecVideo spec={spec} />,
];

const VIDEOS: [string, [VideoSpec, React.FC]][] = [
  ["Elettromec1-ConsigliInverno", make(video1)],
  ["Elettromec2-DomandeWhatsApp", make(video2)],
  ["Elettromec3-Avviatori", make(video3)],
  ["Elettromec4-ServizioSOS", make(video4)],
  ["Elettromec5-Rigenerazione", make(video5)],
];

export const ElettromecCompositions: React.FC = () => (
  <Folder name="Elettromec">
    {VIDEOS.map(([id, [spec, Video]]) => (
      <Composition
        key={id}
        id={id}
        component={Video}
        durationInFrames={durationOf(spec)}
        fps={FPS}
        width={1080}
        height={1920}
      />
    ))}
  </Folder>
);
