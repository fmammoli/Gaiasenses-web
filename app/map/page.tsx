import { getWeather } from "@/components/compositions/lluvia/lluvia";
import dynamic from "next/dynamic";
import AppTitle from "../app-title";
import { getLightning } from "@/components/compositions/zigzag/zigzag";
import { getFireSpots } from "@/components/compositions/bonfire/bonfire";
import WeatherInfoPanel from "../compositions/[composition]/weather-info-panel";
import CompositionsCombobox from "./compositions-combobox";
import CompositionsInfo from "@/components/compositions/compositions-info";
import { Suspense } from "react";

const DynamicMap = dynamic(() => import("./map"), { ssr: false });

function stringToBool(text: string | undefined | null) {
  if (text && text === "true") return true;
  return false;
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

  const compositionInfo = Object.entries(CompositionsInfo).filter(
    (item) => item[0].toLowerCase() === composition?.toLowerCase()
  );

  const Composition = compositionInfo[0]?.[1]?.Component;

  return (
    <div className="grid grid-rows-1 grid-cols-[repeat(2,50%)] h-full isolate">
      <div className="row-start-1 row-end-2 col-start-1 col-end-2">
        <DynamicMap lat={lat} lon={lon}>
          <>
            <Suspense fallback={<p>Loading...</p>}>
              <WeatherInfoPanel
                lat={lat}
                lon={lon}
                mode={"compact"}
              ></WeatherInfoPanel>
            </Suspense>
            <div className="w-full">
              <CompositionsCombobox></CompositionsCombobox>
            </div>
          </>
        </DynamicMap>
      </div>

      <div className="row-start-1 row-end-2 col-start-2 col-end-3">
        {lat && lon && Composition && (
          <Composition
            lat={lat}
            lon={lon}
            play={stringToBool(play ?? "false")}
            today
            debug={false}
          ></Composition>
        )}
      </div>
      <div className="col-start-[1] col-end-[3] row-start-1 row-end-2 z-10 h-fit flex mx-auto">
        <AppTitle></AppTitle>
      </div>
    </div>
  );
}
