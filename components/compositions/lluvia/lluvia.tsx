import { getWeather } from "@/components/getData";
import LluviaSketch from "./lluvia-sketch";
import Composition from "../composition";

import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";
import { PatchData } from "@/hooks/types";

function newMessages(rainData: number) {
  const patchData: PatchData = {
    path: "/lluviaSlider.wasm",
    messages: [
      {
        nodeId: "n_0_56",
        portletId: "0",
        //message: [0, 1000, 1, rainData, "", ""],
        message: [1000 / (rainData === 0 ? 1 : rainData)],
        valueIndex: 3,
        name: "rain",
      },
    ],
  };

  return patchData;
}

export default async function Lluvia({
  lat,
  lon,
  debug = false,
  today = false,
  play,
  rain,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  today?: boolean;
  play: boolean;
  rain?: number;
}) {
  let rainData = 0;
  try {
    if (rain) {
      rainData = rain;
    } else {
      if (today) {
        const data = await getWeather(lat, lon);
        rainData = data.rain.hasOwnProperty("1h")
          ? (data.rain as { "1h": number })["1h"]
          : 0;
      }
    }
  } catch (error) {}

  const { path, messages } = newMessages(rainData);

  return (
    <Composition>
      <LluviaSketch rain={rainData} play={play}></LluviaSketch>
      <CompositionControls
        play={play}
        patchPath={path}
        messages={messages}
      ></CompositionControls>
      {debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
