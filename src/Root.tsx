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
import {
  Testosterone,
  TESTO_DURATION,
  TESTO_FPS,
} from "./Testosterone";
import {
  Nad,
  NAD_DURATION,
  NAD_FPS,
  NAD_YT_DURATION,
  NadYouTube,
} from "./Nad";
import { NADIG_DURATION, NADIG_FPS, NadInstagram } from "./NadIG";
import { ESTRO_DURATION, ESTRO_FPS, Estrogeni } from "./Estrogeni";
import {
  IV_DURATION,
  IV_FPS,
  IV_V_DURATION,
  IV_YT_DURATION,
  IvTherapy,
  IvTherapyInstagram,
  IvTherapyYouTube,
} from "./IvTherapy";

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
        id="LongevaTestosterone"
        component={Testosterone}
        durationInFrames={TESTO_DURATION}
        fps={TESTO_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="LongevaNad"
        component={Nad}
        durationInFrames={NAD_DURATION}
        fps={NAD_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="LongevaNadYouTube"
        component={NadYouTube}
        durationInFrames={NAD_YT_DURATION}
        fps={NAD_FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="LongevaNadInstagram"
        component={NadInstagram}
        durationInFrames={NADIG_DURATION}
        fps={NADIG_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="LongevaEstrogeni"
        component={Estrogeni}
        durationInFrames={ESTRO_DURATION}
        fps={ESTRO_FPS}
        width={1080}
        height={1920}
      />
      <Composition id="LongevaIvTherapy" component={IvTherapy} durationInFrames={IV_DURATION} fps={IV_FPS} width={1920} height={1080} />
      <Composition id="LongevaIvTherapyYouTube" component={IvTherapyYouTube} durationInFrames={IV_YT_DURATION} fps={IV_FPS} width={1920} height={1080} />
      <Composition id="LongevaIvTherapyInstagram" component={IvTherapyInstagram} durationInFrames={IV_V_DURATION} fps={IV_FPS} width={1080} height={1920} />
    </>
  );
};
