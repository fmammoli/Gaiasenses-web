import Composition from "../composition";
import WindLinesRESketch from "./wind-lines-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

const light = '/audios/wind-linesLight.wav';
const medium = '/audios/wind-linesMedium.wav';
const heavy = '/audios/wind-linesHeavy.wav';

function getAudio(speed: number) {
  if(speed <= 11){return light;}
  if(speed >= 12 && speed <= 24){return medium;}
  if(speed >= 25){return heavy;}
}

export type WindLinesREProps = {
  lat: string;
  lon: string;
  speed?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function WindLinesRE(props: WindLinesREProps) {
  let speed = props.speed ?? 0;
  let windLinesAudio;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon);
      speed = data.wind.speed;
    }
  } catch (error) {
    console.log(error);
  }

  windLinesAudio = getAudio(speed);

  return (
    <Composition>
	    <WindLinesRESketch speed={speed} play={props.play} />
        <CompositionControls play={props.play} mp3 patchPath={windLinesAudio}/>
        {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
