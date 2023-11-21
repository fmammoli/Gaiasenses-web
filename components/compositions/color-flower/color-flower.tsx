import getData from "@/components/getData";

import ColorFlowerSketch from "./color-flower-sketch";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { RainfallResponseData } from "@/hooks/types";

export async function getWeather(
  lat: string,
  lon: string
): Promise<RainfallResponseData> {
  return getData("rainfall", lat, lon);
}

export default async function ColorFlower({
  lat,
  lon,
  debug = false,
  today = false,
  play,
  temperature,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  play: boolean;
  temperature?: number;
}) {
  let temperatureData = temperature ?? 0;

  if (today) {
    const data = await getWeather(lat, lon);
    temperatureData = data.main.temp ?? 0;
  }
  console.log("Rerender color flower ", temperatureData);
  return (
    <Composition>
      <ColorFlowerSketch
        temperature={temperatureData}
        play={play}
      ></ColorFlowerSketch>
      <CompositionControls play={play}></CompositionControls>
      <DebugPanel></DebugPanel>
    </Composition>
  );
}
