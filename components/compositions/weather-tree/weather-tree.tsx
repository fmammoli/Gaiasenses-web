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
  refresh?: string;
};

export default async function WeatherTree(props: WeatherTreeProps) {
  const refreshKey = props.refresh ?? "default";
  return (
    <Composition>
      <WeatherTreeSketch key={refreshKey} play={props.play} />
      <CompositionControls play={props.play} />
      {<DebugPanel data={[{  }]} />}
    </Composition>
  );
}
