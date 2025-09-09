import Composition from "../composition";
import PaintBrushSketch from "./paint-brush-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

export type PaintBrushProps = {
  lat: string;
  lon: string;
  humidity?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
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

  const refreshKey = props.refresh ?? "default";

  return (
    <Composition>
      <PaintBrushSketch key={refreshKey} humidity={humidity} play={props.play} />
      <CompositionControls play={props.play} />
      {<DebugPanel data={[{ humidity }]} />}
    </Composition>
  );
}
