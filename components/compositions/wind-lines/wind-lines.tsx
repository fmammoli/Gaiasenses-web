import Composition from "../composition";
import WindLinesRESketch from "./wind-lines-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

const light = '/audios/wind-linesLight.wav';
const medium = '/audios/wind-linesMedium.wav';
const heavy = '/audios/wind-linesHeavy.wav';

function getAudio(windSpeed: number) {
  if(windSpeed <= 11){return light;}
  if(windSpeed >= 12 && windSpeed <= 24){return medium;}
  if(windSpeed >= 25){return heavy;}
}

export type WindLinesREProps = {
  lat: string;
  lon: string;
  windSpeed?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
};

export default async function WindLinesRE(props: WindLinesREProps) {
  let windSpeed = props.windSpeed ?? 0;
  let windLinesAudio;

  try {
    if (props.today) {
      const data = await getWeather(props.lat, props.lon);
      windSpeed = data.wind.speed;
    }
  } catch (error) {
    console.log(error);
  }

  const refreshKey = props.refresh ?? "default";
  windLinesAudio = getAudio(windSpeed);

  return (
    <Composition>
	    <WindLinesRESketch key={refreshKey} windSpeed={windSpeed} play={props.play} />
        <CompositionControls play={props.play} mp3 patchPath={windLinesAudio}/>
        {<DebugPanel data={[{ windSpeed }]} />}
    </Composition>
  );
}
