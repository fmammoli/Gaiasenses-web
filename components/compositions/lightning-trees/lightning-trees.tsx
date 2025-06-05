import Composition from "../composition";
import LightningTreesSketch from "./lightning-trees-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getLightning } from "@/components/getData";
import Pd4WebPlayer from "../pd4web-player";

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
  const packageName = "/humansparks/pd4web.data";
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
      <Pd4WebPlayer packageName={packageName} play={props.play}></Pd4WebPlayer>
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
