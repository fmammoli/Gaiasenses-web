import Composition from "../composition";
import PaintBrushSketch from "./paint-brush-sketch";
import CompositionControls from "../composition-controls";

export type PaintBrushProps = {
  lat: string;
  lon: string;
  humidity: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function PaintBrush(props: PaintBrushProps) {
  const humidity = props.humidity;

  return (
    <Composition>
      <PaintBrushSketch
        humidity={humidity}
        play={props.play} />
      <CompositionControls play={props.play} />
    </Composition>
  );
}
