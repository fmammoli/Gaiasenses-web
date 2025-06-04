import Composition from "../composition";
import AttractorSketch from "./attractor-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getLightning } from "@/components/getData";
import Pd4WebPlayer from "../pd4web-player";
import usePd4Web from "@/hooks/use-pd4web";

export type AttractorProps = {
  lat: string;
  lon: string;
  lightningCount?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function Attractor(props: AttractorProps) {
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
      <AttractorSketch lightningCount={lightningCount} play={props.play} />
      <CompositionControls play={props.play} />
      <Pd4WebPlayer packageName="/thunder4/pd4web.data" />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
