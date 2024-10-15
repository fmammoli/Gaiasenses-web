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
      {/* <Image
        src={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${
          props.lon
        },${props.lat},14,0/${1000}x${1000}@2x?access_token=${ACCESS_TOKEN}`}
        alt={""}
        width={1000}
        height={1000}
        className={"animate-my-rotate-hue"}
      ></Image> */}
      <SatSketch lat={props.lat} lon={props.lon}></SatSketch>
      <Discrete></Discrete>
      {/* <ItsGonnaRain></ItsGonnaRain> */}
    </Composition>
  );
}
