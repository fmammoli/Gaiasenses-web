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
  let temperatureData = temperature ?? 0;
  let windDegData = windDeg ?? 0;
  let windSpeedData = windSpeed ?? 0;

  if (today) {
    //TO-DO
    //make the fetch here
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
