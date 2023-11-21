import Composition from "../composition";
import WeatherTreeSketch from "./weather-tree-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type WeatherTreeProps = {
  lat: string;
  lon: string;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function WeatherTree(props: WeatherTreeProps) {
  return (
    <Composition>
      <WeatherTreeSketch play={props.play} />
      <CompositionControls play={props.play} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
