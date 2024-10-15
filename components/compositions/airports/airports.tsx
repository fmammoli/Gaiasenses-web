import Composition from "../composition";
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
  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN;
  console.log(props);
  return (
    <Composition>
      {/* <AirportsSketch></AirportsSketch> */}
      <SatSketch lat={props.lat} lon={props.lon}></SatSketch>
      <Discrete></Discrete>
      {/* <ItsGonnaRain></ItsGonnaRain> */}
    </Composition>
  );
}
