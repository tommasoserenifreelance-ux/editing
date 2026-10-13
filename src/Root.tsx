import { Composition } from "remotion";
import { ICED_LATTE_DURATION, IcedLatte } from "./IcedLatte";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      // npx remotion render IcedLatte out/iced-latte.mp4
      id="IcedLatte"
      component={IcedLatte}
      durationInFrames={ICED_LATTE_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
