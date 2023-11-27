import Composition from "../composition";
import RectanglesSketch from "./rectangles-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "../lluvia/lluvia";

export type RectanglesProps = {
  lat: string;
  lon: string;
  rain?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function Rectangles(props: RectanglesProps) {
  let rainData = props.rain ?? 0;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon);
      rainData = data.rain.hasOwnProperty("1h")
        ? (data.rain as { "1h": number })["1h"]
        : 0;
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <Composition>
      <RectanglesSketch rain={rainData} play={props.play} />
      <CompositionControls play={props.play} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
