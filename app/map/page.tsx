import dynamic from "next/dynamic";
import AppTitle from "../app-title";
import WeatherInfoPanel from "../compositions/[composition]/weather-info-panel";
import CompositionsCombobox from "./compositions-combobox";
import CompositionsInfo, {
  CompositionsInfoType,
} from "@/components/compositions/compositions-info";
import { Suspense } from "react";
import MyErrorBoudary from "./error-boundry-client";
import {
  getWeather,
  getFireSpots,
  getLightning,
  getBrightness,
} from "@/components/getData";

const DynamicMap = dynamic(() => import("./map"), { ssr: false });

function stringToBool(text: string | undefined | null) {
  if (text && text === "true") return true;
  return false;
}

const compositions = Object.entries(CompositionsInfo).map((item) => {
  const newItem = {
    label: item[1].name,
    value: item[0],
  };
  return newItem;
});

async function getDefaultComposition(lat: string, lon: string) {
  const [weather, firespots, lightning, brightness] = await Promise.all([
    getWeather(lat, lon),
    getFireSpots(lat, lon),
    getLightning(lat, lon, 50),
    getBrightness(lat, lon),
  ]);

  const rain = Object.hasOwn(weather.rain, "1h")
    ? (weather.rain as { "1h": number })["1h"]
    : 0;

  if (firespots.count > 0) {
    return CompositionsInfo.bonfire;
  } else if (brightness.temp < -50) {
    return CompositionsInfo.curves;
  } else if (rain > 5) {
    return CompositionsInfo.lluvia;
  } else if (lightning.count > 5) {
    return CompositionsInfo.zigzag;
  } else {
    return CompositionsInfo.colorFlower;
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: {
    lat: string;
    lon: string;
    play: string;
    composition: string;

    [key: string]: string;
  };
}) {
  const { lat, lon, play, composition } = searchParams;

  let compositionIndex = Object.entries(CompositionsInfo).findIndex(
    (item) => item[0].toLowerCase() === composition?.toLowerCase()
  );
  let compositionInfo: CompositionsInfoType[keyof CompositionsInfoType];

  if (compositionIndex >= 0) {
    compositionInfo = Object.entries(CompositionsInfo)[compositionIndex][1];
  } else {
    compositionInfo = await getDefaultComposition(lat, lon);
    compositionIndex = compositions.findIndex(
      (item) => item.label === compositionInfo.name
    );
  }

  const Composition = compositionInfo.Component;

  return (
    <div className="grid grid-rows-1 grid-cols-[repeat(2,50%)] h-full isolate">
      <div className="row-start-1 row-end-2 col-start-1 col-end-2">
        <DynamicMap lat={lat} lon={lon}>
          <>
            <Suspense fallback={<p>Loading weather info...</p>}>
              <WeatherInfoPanel lat={lat} lon={lon} mode={"compact"}>
                <div className="w-full">
                  <CompositionsCombobox
                    options={compositions}
                    initial={compositionIndex}
                  ></CompositionsCombobox>
                </div>
              </WeatherInfoPanel>
            </Suspense>
          </>
        </DynamicMap>
      </div>

      <div className="row-start-1 row-end-2 col-start-2 col-end-3">
        {lat && lon && Composition && (
          <Composition
            key={`${lat}_${lon}_${compositionInfo.name}`}
            lat={lat}
            lon={lon}
            play={stringToBool(play ?? "false")}
            today
            debug={false}
          ></Composition>
        )}
      </div>
      <div
        className={`col-start-[1] col-end-[3] row-start-1 row-end-2 z-10 h-fit flex mx-auto transition-transform transform-gpu duration-500 ${
          play === "true" ? "translate-x-[60%]" : "translate-x-[0]"
        }`}
      >
        <AppTitle></AppTitle>
      </div>
    </div>
  );
}
