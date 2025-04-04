import { getFireSpots } from "@/components/getData";
import Composition from "../composition";
import BurningTreesSketch from "./burning-trees-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

const noFire = "/audios/burningTrees_noFire.wav";
const fireNoise = "/audios/burningTrees_audio.mp3" ;

function getAudio(fireNumber: number){
  if (fireNumber == 0){return noFire;}
  else{return fireNoise}
}

export type BurningTreesProps = {
  lat: string;
  lon: string;
  fireNumber?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function BurningTrees(props: BurningTreesProps) {
  let fireNumber = props.fireNumber ?? 0;
  let burningTreesAudio;

  try {
    if (props.today) {
      const fireData = await getFireSpots(props.lat, props.lon, 100);
      fireNumber = fireData.count;
    }
  } catch (error) {
    console.log(error);
  }

  burningTreesAudio = getAudio(fireNumber)

  return (
    <Composition>
	    <BurningTreesSketch fireNumber={fireNumber} play={props.play} />
        <CompositionControls play={props.play} mp3 patchPath={burningTreesAudio}/>
        {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
