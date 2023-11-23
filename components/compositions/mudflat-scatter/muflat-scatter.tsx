import Composition from "../composition";

import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { getWeather } from "../lluvia/lluvia";
import { getLightning } from "../zigzag/zigzag";
import MudflatScatterSketch from "./mudflat-scatter-sketch";
import { PatchData } from "@/hooks/types";

export type MudflatScatterProps = {
  lat: string;
  lon: string;
  temperature?: number;
  windDeg?: number;
  windSpeed?: number;
  play: boolean;
  debug?: boolean;
  today?: boolean;
};

export default async function MudflatScatter(props: MudflatScatterProps) {
  let temperature = props.temperature ?? 0;
  let windDeg = props.windDeg ?? 0;
  let windSpeed = props.windSpeed ?? 0;

  if (props.today) {
    const data = await getWeather(props.lat, props.lon);
    temperature = data.main.temp;
    windDeg = data.wind.deg;
    windSpeed = data.wind.speed;
  }

  const patchData: PatchData = {
    path: "/ambient_2.wasm",
    messages: [
      {
        nodeId: "n_0_29",
        portletId: "0",
        message: [1],
        valueIndex: 3,
        name: "rain",
      },
    ],
  };

  //nodeId "n_0_29" portletId "0"
  //      * type "tgl"
  //      * args [1,0,0,"",""]
  //      * label "ON"

  return (
    <Composition>
      <MudflatScatterSketch
        temperature={temperature}
        windDeg={windDeg}
        windSpeed={windSpeed}
        play={props.play}
      ></MudflatScatterSketch>

      <CompositionControls
        play={props.play}
        patchPath={patchData.path}
        messages={patchData.messages}
      />
      {props.debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
