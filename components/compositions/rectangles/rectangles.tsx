import Composition from "../composition";
import RectanglesSketch from "./rectangles-sketch";
import CompositionControls from "../composition-controls";

export type RectanglesProps = {
  lat: string;
  lon: string;
  rain?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function Rectangles(props: RectanglesProps) {
  let rainData = props.rain ?? 0;

  return (
    <Composition>
      <RectanglesSketch
        rain={rainData}
        play={props.play} />
      <CompositionControls play={props.play} />
    </Composition>
  );
}
