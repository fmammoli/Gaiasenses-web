import Composition from "../composition";
import DigitalOrganismSketch from "./digital-organism-sketch";
import CompositionControls from "../composition-controls";

export type BonfireProps = {
  lat: string;
  lon: string;
  rain: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function DigitalOrganism(props: BonfireProps) {
  let rain = props.rain ?? 0;

  return (
    <Composition>
      <DigitalOrganismSketch
        rain={rain}
        play={props.play} />
      <CompositionControls play={props.play} />
    </Composition>
  );
}
