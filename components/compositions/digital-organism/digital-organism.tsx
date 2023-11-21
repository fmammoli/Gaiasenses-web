import Composition from "../composition";
import DigitalOrganismSketch from "./digital-organism-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "../color-flower/color-flower";

export type DigitalOrganismProps = {
  lat: string;
  lon: string;
  rain?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function DigitalOrganism(props: DigitalOrganismProps) {
  let rain = props.rain ?? 0;

  if (props.today) {
    const data = await getWeather(props.lat, props.lon);
    rain = data.rain.hasOwnProperty("1h")
      ? (data.rain as { "1h": number })["1h"]
      : 0;
  }

  return (
    <Composition>
      <DigitalOrganismSketch rain={rain} play={props.play} />
      <CompositionControls play={props.play} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
