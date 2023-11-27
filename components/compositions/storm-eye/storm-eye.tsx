import DebugPanel from "@/components/debug-panel/debug-panel";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import StormEyeSketch from "./storm-eye-sketch";
import { getWeather } from "../color-flower/color-flower";

const forte_concentrado = "/audios/StormEYE-ForteConcentrado.mp3";
const forte_espalhado = "/audios/StormEYE-ForteEspalhado.mp3";
const suave_concentrado = "/audios/StormEYE-SuaveConcentrado.mp3";
const suave_espalhado = "/audios/StormEYE-SuaveEspalhado.mp3";

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

export default async function StormEye({
  lat,
  lon,
  debug = false,
  today = false,
  temperature,
  windDeg,
  windSpeed,
  play,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  temperature?: number;
  windDeg?: number;
  windSpeed?: number;
  play: boolean;
}) {
  let temperatureData = temperature ?? 0;
  let windDegData = windDeg ?? 0;
  let windSpeedData = windSpeed ?? 0;

  let audioPath = "";

  try {
    if (today) {
      const data = await getWeather(lat, lon);
      temperatureData = data.main.temp;
      windDegData = data.wind.deg;
      windSpeedData = data.wind.speed;
      audioPath = getAudio(windDegData, windSpeedData);
    }
  } catch (error) {
    console.log(error);
  }

  return (
    <Composition>
      <StormEyeSketch
        temperature={temperatureData}
        windDeg={windDegData}
        windSpeed={windSpeedData}
        play={play}
      ></StormEyeSketch>
      <CompositionControls
        play={play}
        mp3
        patchPath={audioPath}
      ></CompositionControls>
      {debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
