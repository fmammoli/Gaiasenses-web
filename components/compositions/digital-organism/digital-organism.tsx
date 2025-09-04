import Composition from "../composition";
import DigitalOrganismSketch from "./digital-organism-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "@/components/getData";

export type DigitalOrganismProps = {
  lat: string;
  lon: string;
  rain?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
  refresh?: string;
};

const audioPath = "/audios/DigitalOrganism-Improviso.mp3";

function getAudio() {
  return audioPath;
}

export default async function DigitalOrganism(props: DigitalOrganismProps) {
  let rain = props.rain ?? 0;

  if (props.today) {
    try {
      const data = await getWeather(props.lat, props.lon);
      rain = data.rain.hasOwnProperty("1h")
        ? (data.rain as { "1h": number })["1h"]
        : 0;
    } catch (error) {
      console.log(error);
    }
  }

  const audio = getAudio();
  const refreshKey = props.refresh ?? "default";

  return (
    <Composition>
      <DigitalOrganismSketch key={refreshKey} rain={rain} play={props.play} />
      <CompositionControls play={props.play} mp3 patchPath={audio} />
      {<DebugPanel data={[{ rain }]} />}
    </Composition>
  );
}
