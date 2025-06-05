import Composition from "../composition";
import LightningBoltsSketch from "./lightning-bolts-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getLightning } from "@/components/getData";

const low = "/audios/lightningBolts_Low.mp3";
const high = "/audios/lightningBolts_High.mp3";

function getAudio(boltCount: number) {
  if (boltCount == 0) {
    return undefined;
  }
  if (boltCount >= 1 && boltCount < 4) {
    return low;
  }
  if (boltCount >= 4) {
    return high;
  }
}

export type LightningBoltsProps = {
  lat: string;
  lon: string;
  boltCount?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function LightningBolts(props: LightningBoltsProps) {
  let boltCount = props.boltCount ?? 0;
  let lightningBoltsAudio;

  try {
    if (props.today) {
      const data = await getLightning(props.lat, props.lon, 100);
      boltCount = data.count;
      console.log(data);
    }
  } catch (error) {
    console.log(error);
  }

  lightningBoltsAudio = getAudio(boltCount);

  return (
    <Composition>
      <LightningBoltsSketch boltCount={boltCount} play={props.play} />
      <CompositionControls
        play={props.play}
        mp3
        patchPath={lightningBoltsAudio}
      />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
