import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import {
  OVERLAY_DURATION,
  OVERLAY_FPS,
  PilatesOverlay,
} from "./PilatesOverlay";
import { PILATES_DURATION, PilatesReformer } from "./PilatesReformer";
import { RB_FPS, RB_VIDEOS, RbVideo, ReginaBistecca } from "./ReginaBistecca";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />
      <Composition
        id="PilatesReformer"
        component={PilatesReformer}
        durationInFrames={PILATES_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="PilatesOverlay"
        component={PilatesOverlay}
        durationInFrames={OVERLAY_DURATION}
        fps={OVERLAY_FPS}
        width={1080}
        height={1920}
      />
      <Folder name="ReginaBistecca">
        {(Object.keys(RB_VIDEOS) as RbVideo[]).map((video) => (
          <Composition
            key={video}
            id={`RB-${video}`}
            component={ReginaBistecca}
            durationInFrames={RB_VIDEOS[video].duration}
            fps={RB_FPS}
            width={1080}
            height={1920}
            defaultProps={{ video }}
          />
        ))}
      </Folder>
    </>
  );
};
