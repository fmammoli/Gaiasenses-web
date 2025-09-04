import { getWeather } from "@/components/getData";

import ColorFlowerSketch from "./color-flower-sketch";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type ColorFlowerProps = {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  temperature?: number;
  play: boolean;
  refresh?: string;
};

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

export default async function StormEye(props: ColorFlowerProps) {
  let temperature = props.temperature ?? 0;

  let audioPath = "";

  if (props.today) {
    try {
      const data = await getWeather(props.lat, props.lon);
      temperature = data.main.temp ?? 0;
    } catch (error) {
      console.log(error);
    }
  }
  audioPath = getAudio(temperature);
  const refreshKey = props.refresh ?? "default";
  
  return (
    <Composition>
      <ColorFlowerSketch
        key={refreshKey}
        temperature={temperature}
        play={props.play}
      ></ColorFlowerSketch>
      <CompositionControls
        play={props.play}
        mp3
        patchPath={audioPath}
      ></CompositionControls>
      {<DebugPanel data={[{ temperature }]} />}
    </Composition>
  );
}
