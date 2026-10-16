import { Composition, Folder, Still } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import {
  Slide1,
  Slide2,
  Slide3,
  Slide4,
  Slide5,
} from "./PostPerimenopausa/Slides";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "./PostPerimenopausa/theme";
import * as Dolore from "./PostDolore/Slides";

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

      <Folder name="PostPerimenopausa">
        {[Slide1, Slide2, Slide3, Slide4, Slide5].map((component, i) => (
          <Still
            key={i}
            id={`Perimenopausa-${i + 1}`}
            component={component}
            width={SLIDE_WIDTH}
            height={SLIDE_HEIGHT}
          />
        ))}
      </Folder>

      <Folder name="PostDolore">
        {[
          Dolore.Slide1,
          Dolore.Slide2,
          Dolore.Slide3,
          Dolore.Slide4,
          Dolore.Slide5,
          Dolore.Slide6,
          Dolore.Slide7,
          Dolore.Slide8,
          Dolore.Slide9,
        ].map((component, i) => (
          <Still
            key={i}
            id={`Dolore-${i + 1}`}
            component={component}
            width={SLIDE_WIDTH}
            height={SLIDE_HEIGHT}
          />
        ))}
      </Folder>
    </>
  );
};
