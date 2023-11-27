import Composition from "../composition";
import LightningTreesSketch from "./lightning-trees-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "../lluvia/lluvia";
import { getLightning } from "../zigzag/zigzag";

export type LightningTreesProps = {
  lat: string;
  lon: string;
  lightningCount?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function LightningTrees(props: LightningTreesProps) {
  let lightningCount = props.lightningCount ?? 0;

  try {
    if (props.today) {
      const data = await getLightning(props.lat, props.lon, 100);
      lightningCount = data.count;
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <Composition>
      <LightningTreesSketch lightningCount={lightningCount} play={props.play} />
      <CompositionControls play={props.play} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
