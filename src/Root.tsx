import { Composition, Folder } from "remotion";
import { COFFEE_FPS, CoffeeCups, coffeeDuration } from "./CoffeeCups";
import {
  COFFEE_INTRO_DURATION,
  COFFEE_INTRO_FPS,
  CoffeeIntro,
} from "./CoffeeIntro";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import {
  OVERLAY_DURATION,
  OVERLAY_FPS,
  PilatesOverlay,
} from "./PilatesOverlay";
import { PILATES_DURATION, PilatesReformer } from "./PilatesReformer";

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
        id="CoffeeCups"
        component={CoffeeCups}
        durationInFrames={coffeeDuration({ cups: 4, crossLast: false })}
        fps={COFFEE_FPS}
        width={1080}
        height={1920}
        defaultProps={{ cups: 4, crossLast: false }}
      />
      <Composition
        id="CoffeeCupsCrossed"
        component={CoffeeCups}
        durationInFrames={coffeeDuration({ cups: 5, crossLast: true })}
        fps={COFFEE_FPS}
        width={1080}
        height={1920}
        defaultProps={{ cups: 5, crossLast: true }}
      />
      <Composition
        id="CoffeeIntro"
        component={CoffeeIntro}
        durationInFrames={COFFEE_INTRO_DURATION}
        fps={COFFEE_INTRO_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
