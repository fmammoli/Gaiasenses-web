import { getWeather } from "@/components/getData";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import PumpSketch from "./pump-sketch";

export type PumpProps = {
  lat: string;
  lon: string;
  temperature?: number;
  windSpeed?: number;
  windDeg?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
};

export default async function Pump(props: PumpProps) {
  let temperature = props.temperature ?? 0;
  let windSpeed = props.windSpeed ?? 0;
  let windDeg = props.windDeg ?? 0;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon);
      temperature = data.main.temp;
      windSpeed = data.wind.speed;
      windDeg = data.wind.deg;
    }
  } catch (error) {
    console.log(error);
  }

  const refreshKey = props.refresh ?? "default";

  return (
    <Composition>
      <PumpSketch
        key={refreshKey}
        temperature={temperature}
        play={props.play}
        windSpeed={windSpeed}
        windDeg={windDeg}
      />
      <CompositionControls play={props.play} />
      {<DebugPanel data={[{ temperature, windSpeed, windDeg }]} />}
    </Composition>
  );
}
