import DebugPanel from "@/components/debug-panel/debug-panel";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import StormEyeSketch from "./storm-eye-sketch";

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
    //TO-DO
    //make the fetch here
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
      <DebugPanel></DebugPanel>
    </Composition>
  );
}
