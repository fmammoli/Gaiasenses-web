import Composition from "../composition";
import LightningTreesSketch from "./lightning-trees-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type LightningTreesProps = {
  lat: string;
  lon: string;
  lightningCount?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function LightningTrees(props: LightningTreesProps) {
  let lightningCount = props.lightningCount ?? 0;

  return (
    <Composition>
      <LightningTreesSketch lightningCount={lightningCount} play={props.play} />
      <CompositionControls play={props.play} />
      <DebugPanel></DebugPanel>
    </Composition>
  );
}
