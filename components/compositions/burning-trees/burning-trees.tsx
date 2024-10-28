import { getFireSpots } from "@/components/getData";
import Composition from "../composition";
import BurningTreesSketch from "./burning-trees-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type BurningTreesProps = {
  lat: string;
  lon: string;
  fireNumber?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function BurningTrees(props: BurningTreesProps) {
  let fireNumber = props.fireNumber ?? 0;

  try {
    if (props.today) {
      const fireData = await getFireSpots(props.lat, props.lon, 100);
      fireNumber = fireData.count;
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <Composition>
	    <BurningTreesSketch fireNumber={fireNumber} play={props.play} />
        <CompositionControls play={props.play} />
        {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
