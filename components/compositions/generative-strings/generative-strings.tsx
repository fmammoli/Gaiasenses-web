import { getWeather } from "@/components/getData";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import GenerativeStringsSketch from "./generative-strings-sketch";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type GenerativeStringsProps = {
  lat: string;
  lon: string;
  temperature?: number;
  windDeg?: number;
  windSpeed?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
};

export default async function GenerativeStrings(props: GenerativeStringsProps) {
  let temperature = props.temperature ?? 24;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon);
      temperature = data.main.temp;
    }
  } catch (error) {
    console.log(error);
  }
  const refreshKey = props.refresh ?? "default";
  return (
    <Composition>
      <GenerativeStringsSketch key={refreshKey} temp={temperature} play={false}></GenerativeStringsSketch>
      <CompositionControls play={props.play}></CompositionControls> 
      {<DebugPanel data={[{ temperature }]} />}
    </Composition>
  );
}
