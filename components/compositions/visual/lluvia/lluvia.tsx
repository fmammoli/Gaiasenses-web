import getData from "@/components/getData";

import ClientWrapper from "../client-wrapper";
import LluviaSketch from "./lluvia-sketch";

export type RainfallResponseData = {
  city: string;
  clouds: number;
  lat: number;
  lon: number;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    temp: number;
  };
  rain: { "1h": number } | {};
  state: string;
  visibility: number;
  weather: [
    {
      description: string;
      icon: string;
      main: string;
    }
  ];
  wind: {
    deg: number;
    gust: number;
    speed: number;
  };
};

export async function getWeather(
  lat: string,
  lon: string
): Promise<RainfallResponseData> {
  return getData("rainfall", lat, lon);
}

export default async function Lluvia({
  lat,
  lon,
  debug = false,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
}) {
  const data = await getWeather(lat, lon);
  const rain = data.rain.hasOwnProperty("1h")
    ? (data.rain as { "1h": number })["1h"]
    : 0;

  return (
    <ClientWrapper debug={debug}>
      <LluviaSketch rain={rain} containerHeight={0}></LluviaSketch>
    </ClientWrapper>
  );
}
