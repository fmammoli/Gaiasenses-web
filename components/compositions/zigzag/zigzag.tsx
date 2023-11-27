import getData from "@/components/getData";
import { getWeather } from "../lluvia/lluvia";
import ZigzagSketch from "./zigzag-sketch";
import Composition from "../composition";
import CompositionControls from "../composition-controls";
import DebugPanel from "@/components/debug-panel/debug-panel";

export type LightningResponseData = {
  city: string;
  count: number;
  events: { lat: string; lon: string; dist?: number }[];
  state: string;
};

export async function getLightning(
  lat: string,
  lon: string,
  dist: number
): Promise<LightningResponseData> {
  return getData("lightning", lat, lon, dist);
}

const zigzagAA = "/audios/ZigZag-AA.mp3";
const zigzagAB = "/audios/ZigZag-AB.mp3";
const zigzagBA = "/audios/ZigZag-BA.mp3";
const zigzagBB = "/audios/ZigZag-BB.mp3";

function getAudio(rain: number, lCount: number) {
  if (rain > 20) {
    if (lCount > 4) {
      return zigzagAA;
    } else {
      return zigzagAB;
    }
  } else {
    if (lCount > 4) {
      return zigzagBA;
    } else {
      return zigzagBB;
    }
  }
}

export default async function Zigzag({
  lat,
  lon,
  debug = false,
  rain,
  lightningCount,
  today = false,
  play,
}: {
  lat: string;
  lon: string;
  debug?: boolean;
  rain?: number;
  lightningCount?: number;
  today?: boolean;
  play: boolean;
}) {
  let rainData = rain ?? 0;
  let lightningCountData = lightningCount ?? 0;
  let audioPath = "";
  if (today) {
    const [weatherData, lightningData] = await Promise.all([
      getWeather(lat, lon),
      getLightning(lat, lon, 50),
    ]);
    rainData = weatherData.rain.hasOwnProperty("1h")
      ? (weatherData.rain as { "1h": number })["1h"]
      : 0;

    lightningCountData = lightningData.count;
    audioPath = getAudio(rainData, lightningCountData);
  }

  return (
    <Composition>
      <ZigzagSketch
        rain={rainData}
        lightningCount={lightningCountData}
        play={play}
      ></ZigzagSketch>
      <CompositionControls
        play={play}
        mp3
        patchPath={audioPath}
      ></CompositionControls>
      {debug && <DebugPanel></DebugPanel>}
    </Composition>
  );
}
