import getData from "@/components/getData";

import ClientWrapper from "../client-wrapper";
import StormEyeSketch from "./storm-eye-sketch";

export default async function StormEye({
  lat,
  lon,
  debug = false,
  today = false,
  temperature,
  windDeg,
  windSpeed,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  temperature?: number;
  windDeg?: number;
  windSpeed?: number;
}) {
  let temperatureData = 0;
  let windDegData = 0;
  let windSpeedData = 0;
  if (temperature && windDeg && windSpeed) {
    temperatureData = temperature;
    windDegData = windDeg;
    windSpeedData = windSpeed;
  } else {
    if (today) {
      //   const data = await getWeather(lat, lon);
      //   rainData = data.rain.hasOwnProperty("1h")
      //     ? (data.rain as { "1h": number })["1h"]
      //     : 0;
    }
  }

  return (
    <ClientWrapper debug={debug}>
      <StormEyeSketch
        temperature={temperatureData}
        windDeg={windDegData}
        windSpeed={windSpeedData}
        containerHeight={0}
        play={false}
      ></StormEyeSketch>
    </ClientWrapper>
  );
}
