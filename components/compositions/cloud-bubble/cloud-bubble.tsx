import Composition from "../composition";
import CloudBubbleSketch from "./cloud-bubble-sketch";
import CompositionControls from "../composition-controls";

export type CloudBubbleProps = {
  lat: string;
  lon: string;
  clouds?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function CloudBubble(props: CloudBubbleProps) {
  let clouds = props.clouds ?? 0;

  return (
    <Composition>
      <CloudBubbleSketch
        clouds={clouds}
        play={props.play} />
      <CompositionControls play={props.play} />
    </Composition>
  );
}
