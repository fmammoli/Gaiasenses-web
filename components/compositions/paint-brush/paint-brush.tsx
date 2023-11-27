import Composition from "../composition";
import PaintBrushSketch from "./paint-brush-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "../lluvia/lluvia";

export type PaintBrushProps = {
  lat: string;
  lon: string;
  humidity?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function PaintBrush(props: PaintBrushProps) {
  let humidity = props.humidity ?? 0;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon);
      humidity = data.main.humidity;
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <Composition>
      <PaintBrushSketch humidity={humidity} play={props.play} />
      <CompositionControls play={props.play} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
