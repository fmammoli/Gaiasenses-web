import getData from "@/components/getData";

import ClientWrapper from "../client-wrapper";
import { RainfallResponseData } from "../lluvia/lluvia";
import ColorFlowerSketch from "./color-flower-sketch";

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
  temperature,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  temperature?: number;
}) {
  let temperatureData = temperature ?? 0;

  if (today) {
    const data = await getWeather(lat, lon);
    temperatureData = data.main.temp && 0;
  }

  return (
    <ClientWrapper debug={debug}>
      <ColorFlowerSketch
        temperature={temperatureData}
        containerHeight={0}
        play={false}
      ></ColorFlowerSketch>
    </ClientWrapper>
  );
}
