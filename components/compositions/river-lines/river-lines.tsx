import Composition from "../composition";
import RiverLinesSketch from "./river-lines-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

const weakCurrent = '/audios/riverLines_weak.wav';
const strongCurrent = '/audios/riverLines_strong.wav';

function getAudio(humidity: number){
  if(humidity > 0 && humidity >= 30){return weakCurrent}
  if(humidity > 30 && humidity <= 100){return strongCurrent} 
}

export type RiverLinesProps = {
  lat: string;
  lon: string;
  humidity?: number;
  temp?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function RiverLines(props: RiverLinesProps) {
  let humidity = props.humidity ?? 0;
  let temp = props.temp ?? 0;
  let riverLinesAudio;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon); 
      humidity = data.main.humidity;
      temp = data.main.temp;
    }
  } catch (error) {
    console.log(error);
  }

  riverLinesAudio = getAudio(humidity);

  return (
    <Composition>
      <RiverLinesSketch humidity={humidity} temp={temp} play={props.play} />
      <CompositionControls play={props.play} mp3 patchPath={riverLinesAudio}/>
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}