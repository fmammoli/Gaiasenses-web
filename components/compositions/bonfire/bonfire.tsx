import getData from "@/components/getData";
import Composition from "../composition";
import BonfireSketch from "./bonfire-sketch";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type BonfireProps = {
  lat: string;
  lon: string;
  dist?: number;
  fireCount?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export type FireSpotsResponseData = {
  city: string;
  count: number;
  events: {
    dist: number;
    lat: number;
    lon: number;
  }[];
  state: string;
};

export async function getFireSpots(
  lat: string,
  lon: string,
  dist?: number
): Promise<FireSpotsResponseData> {
  return await getData("fire", lat, lon, dist);
}

export default async function Bonfire(props: BonfireProps) {
  let fireCount = props.fireCount ?? 0;

  if (props.today) {
    const fireData = await getFireSpots(props.lat, props.lon, 100);
    fireCount = fireData.count;
  }

  return (
    <Composition>
      <BonfireSketch fireCount={fireCount} play={props.play} />
      <CompositionControls play={props.play} />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
