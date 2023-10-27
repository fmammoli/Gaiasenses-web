import getData from "@/components/getData";
import { getWeather } from "../lluvia/lluvia";
import ClientWrapper from "../client-wrapper";
import ZigzagSketch from "./zigzag-sketch";

export type LightningResponseData = {
  city: string;
  count: number;
  events: [];
  state: string;
};

export async function getLightning(
  lat: string,
  lon: string,
  dist: number
): Promise<LightningResponseData> {
  return getData("lightning", lat, lon, dist);
}

export default async function Zigzag({
  lat,
  lon,
  debug = false,
  rain,
  lightningCount,
  today = false,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  rain?: number;
  lightningCount?: number;
  today?: boolean;
}) {
  let rainData = rain ?? 0;
  let lightningCountData = lightningCount ?? 0;

  if (today) {
    const [weatherData, lightningData] = await Promise.all([
      getWeather(lat, lon),
      getLightning(lat, lon, 50),
    ]);
    rainData = weatherData.rain.hasOwnProperty("1h")
      ? (weatherData.rain as { "1h": number })["1h"]
      : 0;

    lightningCountData = lightningData.count;
  }

  return (
    <ClientWrapper debug={debug}>
      <ZigzagSketch
        rain={rainData}
        lightningCount={lightningCountData}
        containerHeight={0}
        play={false}
      ></ZigzagSketch>
    </ClientWrapper>
  );
}
