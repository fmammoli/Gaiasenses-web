import Composition from "../composition";
import WindLinesSketch from "./wind-lines-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

export type WindLinesProps = {
  lat: string;
  lon: string;
  speed?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function WindLines(props: WindLinesProps) {
  let speed = props.speed ?? 0;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon);
      speed = data.wind.speed;
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <Composition>
	    <WindLinesSketch speed={speed} play={props.play} />
        <CompositionControls play={props.play} />
        {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
