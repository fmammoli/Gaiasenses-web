import Composition from "../composition";
import NightRainSketch from "./night-rain-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

const light = '/audios/NRlight.mp3';
const medium = '/audios/NRmedium.mp3';
const heavy = '/audios/NRheavy.mp3';

function getAudio(humidity: number) { //apenas parametros que serão usados na função, por exemplo, excluímos 'temp' neste caso, apesar dela existir no sketch
  if(humidity < 30){return light;}
  if(humidity >= 30 && humidity < 60){return medium;}
  if(humidity >= 60){return heavy;}
}

export type NightRainProps = {
  lat: string;
  lon: string;
  humidity?: number;
  temp?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function NightRain(props: NightRainProps) {
  let humidity = props.humidity ?? 0;
  let temp = props.temp ?? 0;
  let nightrainAudio;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon); 
      humidity = data.main.humidity;
      temp = data.main.temp;
    }
  } catch (error) {
    console.log(error);
  }

  nightrainAudio = getAudio(humidity); //apenas parametros da função getAudio

  return (
    <Composition>
	    <NightRainSketch humidity={humidity} temp={temp} play={props.play} />
        <CompositionControls play={props.play} mp3 patchPath={nightrainAudio}/>
        {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}