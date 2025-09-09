import Composition from "../composition";

import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";
import MudflatScatterSketch from "./mudflat-scatter-sketch";

const flor_10 = "/audios/Flor-infinito_10.mp3";
const flor_10_15 = "/audios/Flor-10_15.mp3";
const flor_15_20 = "/audios/Flor-15_20.mp3";
const flor_20_25 = "/audios/Flor-20_25.mp3";
const flor_25_30 = "/audios/Flor-25_30.mp3";
const flor_30 = "/audios/Flor-30_infinito.mp3";

function getAudio(temp: number) {
  if (temp < 10) return flor_10;

  if (temp >= 10 && temp < 15) return flor_10_15;

  if (temp >= 15 && temp < 20) return flor_10_15;

  if (temp >= 15 && temp < 20) return flor_15_20;

  if (temp >= 20 && temp < 25) return flor_20_25;

  if (temp >= 25 && temp < 30) return flor_25_30;

  if (temp >= 30) return flor_30;

  return flor_30;
}

export type MudflatScatterProps = {
  lat: string;
  lon: string;
  temperature?: number;
  windDeg?: number;
  windSpeed?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
};

export default async function MudflatScatter(props: MudflatScatterProps) {
  let temperature = props.temperature ?? 0;
  let windDeg = props.windDeg ?? 0;
  let windSpeed = props.windSpeed ?? 0;

  // try {
  //   if (props.today) {
  //     const data = await getWeather(props.lat, props.lon);
  //     temperature = data.main.temp;
  //     windDeg = data.wind.deg;
  //     windSpeed = data.wind.speed;
  //   }
  // } catch (error) {}

  // const patchData: PatchData = {
  //   path: "/ambient_2.wasm",
  //   messages: [
  //     {
  //       nodeId: "n_0_286",
  //       portletId: "0",
  //       message: [1],
  //       valueIndex: 3,
  //       name: "rain",
  //     },
  //   ],
  // };

  //nodeId "n_0_29" portletId "0"
  //      * type "tgl"
  //      * args [1,0,0,"",""]
  //      * label "ON"

  let audioPath = "";

  if (props.today) {
    try {
      const data = await getWeather(props.lat, props.lon);
      temperature = data.main.temp ?? 0;
      windDeg = data.wind.deg;
      windSpeed = data.wind.speed;
    } catch (error) {
      console.log(error);
    }
  }
  audioPath = getAudio(temperature);
  const refreshKey = props.refresh ?? "default";
  return (
    <Composition>
      <MudflatScatterSketch
        key={refreshKey}
        temperature={temperature}
        windDeg={windDeg}
        windSpeed={windSpeed}
        play={props.play}
      ></MudflatScatterSketch>
      <CompositionControls
        play={props.play}
        mp3
        patchPath={audioPath}
      ></CompositionControls>
      {<DebugPanel data={[{ temperature, windDeg, windSpeed }]} />}
    </Composition>
  );
}
