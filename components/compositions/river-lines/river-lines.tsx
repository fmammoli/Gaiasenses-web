import Composition from "../composition";
import RiverLinesSketch from "./river-lines-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

const weakCurrent = '/audios/riverLines_weak.wav';
const strongCurrent = '/audios/riverLines_strong.wav';

function getAudio(humidity: number){
  if(humidity > 0 && humidity <= 30){return weakCurrent}
  if(humidity > 30 && humidity <= 100){return strongCurrent} 
}

export type RiverLinesProps = {
  lat: string;
  lon: string;
  humidity?: number;
  temperature?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
};

export default async function RiverLines(props: RiverLinesProps) {
  let humidity = props.humidity ?? 0
  let temperature = props.temperature ?? 0
  let riverLinesAudio;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon); 
      humidity = data.main.humidity;
      temperature = data.main.temp;
    }
  } catch (error) {
    console.log(error);
  }

  const refreshKey = props.refresh ?? "default";
  riverLinesAudio = getAudio(humidity);

  //comentar debug panel dentro das aspas para desativar como consta abaixo, funciona para todas as animações:
  /*<DebugPanel data={[{ humidity, temperature }]} />*/

return (
  <Composition>
    <RiverLinesSketch key={refreshKey} humidity={humidity} temperature={temperature} play={props.play} />
    <CompositionControls play={props.play} mp3 patchPath={riverLinesAudio}/>
    {<DebugPanel data={[{ humidity, temperature }]} />}
  </Composition>
  );
}
