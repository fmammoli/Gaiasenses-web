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

export type PatchData = {
  patchPath: string;
  messages: {
    nodeId: string;
    portletId: string;
    message: (string | number)[];
    valueIndex: number;
    name: string;
  }[];
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
  today = false,
  play,
  rain,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  play: boolean;
  rain?: number;
}) {
  let rainData = 0;
  if (rain) {
    rainData = rain;
  } else {
    if (today) {
      const data = await getWeather(lat, lon);
      rainData = data.rain.hasOwnProperty("1h")
        ? (data.rain as { "1h": number })["1h"]
        : 0;
    }
  }

  const patchData: PatchData = {
    patchPath: "/lluviaSlider.wasm",
    messages: [
      {
        nodeId: "n_0_56",
        portletId: "0",
        message: [0, 1000, 1, 1000 / (rainData == 0 ? 1 : rainData), "", ""],
        valueIndex: 3,
        name: "rain",
      },
    ],
  };

  return (
    <ClientWrapper debug={debug} {...patchData}>
      <LluviaSketch rain={rainData} play={play}></LluviaSketch>
    </ClientWrapper>
  );
}
