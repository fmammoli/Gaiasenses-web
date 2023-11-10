import Composition from "../composition";
import PaintBrushSketch from "./paint-brush-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type PaintBrushProps = {
  lat: string;
  lon: string;
  humidity?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function PaintBrush(props: PaintBrushProps) {
  const humidity = props.humidity ?? 0;

  return (
    <Composition>
      <PaintBrushSketch humidity={humidity} play={props.play} />
      <CompositionControls play={props.play} />
      <DebugPanel></DebugPanel>
    </Composition>
  );
}
