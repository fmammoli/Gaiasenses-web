import Composition from "../composition";
import CloudBubbleSketch from "./cloud-bubble-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "../color-flower/color-flower";

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

  if (props.today) {
    const data = await getWeather(props.lat, props.lon);
    clouds = data.clouds;
  }

  return (
    <Composition>
      <CloudBubbleSketch clouds={clouds} play={props.play} />
      <CompositionControls play={props.play} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
