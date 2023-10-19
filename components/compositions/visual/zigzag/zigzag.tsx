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
}: {
  lat: string;
  lon: string;
  debug?: boolean;
}) {
  try {
    const [weatherData, lightningData] = await Promise.all([
      getWeather(lat, lon),
      getLightning(lat, lon, 50),
    ]);
    const rain = weatherData.rain.hasOwnProperty("1h")
      ? (weatherData.rain as { "1h": number })["1h"]
      : 0;

    const lightningCount = lightningData.count;

    return (
      <ClientWrapper debug={debug}>
        <ZigzagSketch
          rain={rain}
          lightningCount={lightningCount}
          containerHeight={0}
        ></ZigzagSketch>
      </ClientWrapper>
    );
  } catch (error) {
    console.log(error);
  }
}
