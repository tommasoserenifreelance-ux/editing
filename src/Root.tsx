import { Composition, Folder } from "remotion";
import { ClassReel, REEL_DURATION, REEL_FPS } from "./ClassReel";
import { DistrettoWall, WALL_DURATION, WALL_FPS } from "./DistrettoWall";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import {
  OVERLAY_DURATION,
  OVERLAY_FPS,
  PilatesOverlay,
} from "./PilatesOverlay";
import { PILATES_DURATION, PilatesReformer } from "./PilatesReformer";
import { POSH_DURATION, POSH_FPS, PoshReel, poshSchema } from "./PoshReel";

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
      <Composition
        id="ClassReel"
        component={ClassReel}
        durationInFrames={REEL_DURATION}
        fps={REEL_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="DistrettoWall"
        component={DistrettoWall}
        durationInFrames={WALL_DURATION}
        fps={WALL_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="PoshReel"
        component={PoshReel}
        schema={poshSchema}
        durationInFrames={POSH_DURATION}
        fps={POSH_FPS}
        width={1080}
        height={1920}
        defaultProps={{ music: "i-put-a-spell-on-you.mp3" }}
      />
      <Composition
        id="DistrettoWall-16x9"
        component={DistrettoWall}
        durationInFrames={WALL_DURATION}
        fps={WALL_FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
