import { getFireSpots } from "@/components/getData";
import Composition from "../composition";
import BonfireSketch from "./bonfire-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

const fogoAA = "/audios/FOGO-AA.mp3";
const fogoAB = "/audios/FOGO-AB.mp3";
const fogoBA = "/audios/FOGO-BA.mp3";
const fogoBB = "/audios/FOGO-BB.mp3";

function getFireAudio(fireCount: number, closeFires: number) {
  if (fireCount >= 4 && closeFires >= 2) {
    return fogoAA;
  }
  if (fireCount >= 4 && closeFires < 2) {
    return fogoAB;
  }
  if (fireCount < 4 && closeFires >= 2) {
    return fogoBA;
  }
  if (fireCount === 0) {
    return fogoBB;
  }
  return fogoBB;
}

export type BonfireProps = {
  lat: string;
  lon: string;
  dist?: number;
  fireCount?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function Bonfire(props: BonfireProps) {
  let fireCount = props.fireCount ?? 0;
  let closeFires = 0;
  let fireAudio = null;
  if (props.today) {
    try {
      const fireData = await getFireSpots(props.lat, props.lon, 100);
      fireCount = fireData.count;
      closeFires = fireData.events.filter((item) => item.dist < 50).length;
    } catch (error) {
      console.log("Server responded with error.");
      console.log(error);
    }
  }

  fireAudio = getFireAudio(fireCount, closeFires);

  return (
    <Composition>
      <BonfireSketch
        key={`${props.lat}_${props.lon}_${"bonfire"}`}
        fireCount={fireCount}
        play={props.play}
      />

      <CompositionControls play={props.play} mp3 patchPath={fireAudio} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
