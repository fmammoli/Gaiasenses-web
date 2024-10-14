import Composition from "../composition";
import CompositionControls from "../composition-controls";
import Discrete from "./discrete";
import Image from "next/image";

export type AirportsProps = {
  play: boolean;
  debug?: boolean;
  today?: boolean;
  lat?: string;
  lon?: string;
};
export default async function Airports(props: AirportsProps) {
  console.log(props);
  const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN;
  const staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${props.lon},${props.lat},14,0/600x400?access_token=${ACCESS_TOKEN}`;

  return (
    <Composition>
      {/* <AirportsSketch></AirportsSketch> */}

      <Image src={staticMapUrl} alt={""} width={600} height={400}></Image>
      <Discrete></Discrete>
      {/* <ItsGonnaRain></ItsGonnaRain> */}
    </Composition>
  );
}
