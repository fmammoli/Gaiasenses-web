import Composition from "../composition";
import NightRainSketch from "./night-rain-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

const light = '/audios/NRlight.mp3';
const medium = '/audios/NRmedium.mp3';
const heavy = '/audios/NRheavy.mp3';

function getAudio(rain: number) { //apenas parametros que serão usados na função, por exemplo, excluímos 'temperature' neste caso, apesar dela existir no sketch
  if(rain == 0){return '';}
  if(rain < 3){return light;}
  if(rain >= 3 && rain < 6){return medium;}
  if(rain >= 6){return heavy;}
}

export type NightRainProps = {
  lat: string;
  lon: string;
  rain?: number;
  temperature?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
};

export default async function NightRain(props: NightRainProps) {
  let rain = props.rain ?? 0;
  let temperature = props.temperature ?? 0;
  let nightrainAudio;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon); 
      rain = data.rain.hasOwnProperty("1h")
        ? (data.rain as { "1h": number })["1h"]
        : 0;
      temperature = data.main.temp;
    }
  } catch (error) {
    console.log(error);
  }

  nightrainAudio = getAudio(rain); //apenas parametros da função getAudio
  const refreshKey = props.refresh ?? "default";

  return (
    <Composition>
	    <NightRainSketch key={refreshKey} rain={rain} temperature={temperature} play={props.play} />
        <CompositionControls play={props.play} mp3 patchPath={nightrainAudio}/>
        {<DebugPanel data={[{ rain, temperature }]} />}
    </Composition>
  );
}