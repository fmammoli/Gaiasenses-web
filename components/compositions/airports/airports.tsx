import Composition from "../composition";
import CompositionControls from "../composition-controls";
import TogglePlayButton from "../toggle-play-button";
import Discrete from "./discrete";
import SatSketch from "./SatSketch";
import Image from "next/image";
export type AirportsProps = {
  play: boolean;
  debug?: boolean;
  today?: boolean;
  lat: string;
  lon: string;
};
export default async function Airports(props: AirportsProps) {
  console.log(props);
  return (
    <Composition>
      {/* <AirportsSketch></AirportsSketch> */}
      <SatSketch lat={props.lat} lon={props.lon}></SatSketch>
      <Discrete play={props.play}></Discrete>
      {/* <ItsGonnaRain></ItsGonnaRain> */}
    </Composition>
  );
}
