import getData from "@/components/getData";
import { RainfallResponseData, getWeather } from "../lluvia/lluvia";
import Composition from "../composition";
import CurvesSketch from "./curves-sketch";
import CompositionControls from "../composition-controls";

export type CurvesProps = {
  lat: string;
  lon: string;
  temperature?: number;
  rain?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function Curves(props: CurvesProps) {
  let rainData = props.rain ?? 0;
  let temperatureData = props.temperature ?? 20;

  if (props.today) {
    const weatherData = await getWeather(props.lat, props.lon);
    rainData = weatherData.rain.hasOwnProperty("1h")
      ? (weatherData.rain as { "1h": number })["1h"]
      : 0;
    temperatureData = weatherData.main.temp;
  }
  return (
    <Composition>
      <CurvesSketch
        rain={rainData}
        temperature={temperatureData}
        play={props.play} />
      <CompositionControls play={props.play} />
    </Composition>
  );
}