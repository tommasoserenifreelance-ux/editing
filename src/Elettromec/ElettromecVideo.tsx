import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Captions, Word } from "./Captions";
import { EndCard, Sfx } from "./graphics";
import { END_CARD, FPS } from "./theme";
import { Zoom, ZoomVideo } from "./ZoomVideo";

export type VideoSpec = {
  src: string;
  seconds: number; // length of the source clip
  words: Word[];
  captionY: number;
  hideCaptions?: [number, number][];
  zooms: Zoom[];
  overlays: React.ReactNode;
};

export const durationOf = (spec: VideoSpec) =>
  Math.ceil(spec.seconds * FPS) + END_CARD;

export const ElettromecVideo: React.FC<{ spec: VideoSpec }> = ({ spec }) => {
  const { fps } = useVideoConfig();
  const footage = Math.ceil(spec.seconds * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence durationInFrames={footage}>
        <ZoomVideo src={spec.src} zooms={spec.zooms} />
        {spec.overlays}
        <Captions
          words={spec.words}
          y={spec.captionY}
          hide={spec.hideCaptions}
        />
      </Sequence>
      <Sequence from={footage}>
        <EndCard />
        <Sfx t={0} name="zap" volume={0.7} />
      </Sequence>
    </AbsoluteFill>
  );
};
