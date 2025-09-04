import DebugPanel from "@/components/debug-panel/debug-panel";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import StormEyeSketch from "./storm-eye-sketch";
import { getWeather } from "@/components/getData";

const forte_concentrado = "/audios/StormEYE-ForteConcentrado.mp3";
const forte_espalhado = "/audios/StormEYE-ForteEspalhado.mp3";
const suave_concentrado = "/audios/StormEYE-SuaveConcentrado.mp3";
const suave_espalhado = "/audios/StormEYE-SuaveEspalhado.mp3";

export type StormEyeProps = {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  temperature?: number;
  windDeg?: number;
  windSpeed?: number;
  play: boolean;
  refresh?: string;
};

function getAudio(windDeg: number, windSpeed: number) {
  if (windSpeed >= 1) {
    if (windDeg >= 0 && windDeg <= 180) {
      return forte_concentrado;
    } else {
      return forte_espalhado;
    }
  } else {
    if (windDeg >= 0 && windDeg <= 180) {
      return suave_concentrado;
    } else {
      return suave_espalhado;
    }
  }
  return suave_concentrado;
}

export default async function StormEye(props: StormEyeProps) {
  let temperature = props.temperature ?? 0;
  let windDeg = props.windDeg ?? 0;
  let windSpeed = props.windSpeed ?? 0;

  let audioPath = "";

  if (props.today) {
    try {
      const data = await getWeather(props.lat, props.lon);
      temperature = data.main.temp;
      windDeg = data.wind.deg;
      windSpeed = data.wind.speed;
    } catch (error) {
      console.log(error);
    }
  }
  audioPath = getAudio(windDeg, windSpeed);
  const refreshKey = props.refresh ?? "default";
  return (
    <Composition>
      <StormEyeSketch
        key={refreshKey}
        temperature={temperature}
        windDeg={windDeg}
        windSpeed={windSpeed}
        play={props.play}
      ></StormEyeSketch>
      <CompositionControls
        play={props.play}
        mp3
        patchPath={audioPath}
      ></CompositionControls>
      {<DebugPanel data={[{ temperature, windDeg, windSpeed }]} />}
    </Composition>
  );
}
