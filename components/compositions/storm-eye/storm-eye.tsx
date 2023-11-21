import DebugPanel from "@/components/debug-panel/debug-panel";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import StormEyeSketch from "./storm-eye-sketch";
import { getWeather } from "../color-flower/color-flower";

export default async function StormEye({
  lat,
  lon,
  debug = false,
  today = false,
  temperature,
  windDeg,
  windSpeed,
  play,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  temperature?: number;
  windDeg?: number;
  windSpeed?: number;
  play: boolean;
}) {
  let temperatureData = temperature ?? 0;
  let windDegData = windDeg ?? 0;
  let windSpeedData = windSpeed ?? 0;

  if (today) {
    const data = await getWeather(lat, lon);
    temperatureData = data.main.temp;
    windDegData = data.wind.deg;
    windSpeedData = data.wind.speed;
  }

  return (
    <Composition>
      <StormEyeSketch
        temperature={temperatureData}
        windDeg={windDegData}
        windSpeed={windSpeedData}
        play={play}
      ></StormEyeSketch>
      <CompositionControls play={play}></CompositionControls>
      {debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
