import CompositionsInfo, {
  AvailableCompositionNames,
} from "@/components/compositions/compositions-info";
import WeatherInfoPanel from "./weather-info-panel";
import { Label } from "@/components/ui/label";

const DEBUG = true;

export default async function Page({
  params,
  searchParams,
}: {
  params: { composition: string };
  searchParams: { lat: string; lon: string; [key: string]: string };
}) {
  const compositionInfo = CompositionsInfo.hasOwnProperty(params.composition)
    ? CompositionsInfo[params.composition as AvailableCompositionNames]
    : null;

  if (searchParams && searchParams.lat && searchParams.lon) {
    if (compositionInfo) {
      const compositionProps: { [key: string]: number } = {};
      compositionInfo.attributes.forEach((attr) => {
        compositionProps[attr] = parseFloat(searchParams[attr]);
      });

      let play = false;
      if (searchParams["play"] && searchParams["play"] === true.toString()) {
        play = true;
      }

      const Component = compositionInfo.Component;
      const props = {
        lat: searchParams.lat,
        lon: searchParams.lon,
        debug: DEBUG,
        ...compositionProps,
        play: play,
      };

      return (
        <div
          className={`grid grid-rows-1 grid-cols-1 bg-[url(/lluvia.png)] isolate`}
        >
          <div className="row-start-1 row-end-2 col-start-1 col-end-[-1]">
            <WeatherInfoPanel
              lat={searchParams.lat}
              lon={searchParams.lon}
            ></WeatherInfoPanel>
          </div>
          <div
            className={`row-start-1 w-full row-end-2 col-start-1 col-end-[-1] bg-background h-[100svh] z-[1] transition-transform [&:has(label>input:checked)]:-translate-y-[16rem] [&:has(label>input:checked)]:rounded-b-[50px] [&:has(label>input:checked)]:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden`}
          >
            {<Component {...props}></Component> ?? <p>Not working Inside</p>}
            <Label className="absolute bottom-4 z-20 bg-black p-4 rounded-lg text-white cursor-pointer left-1/2 -translate-x-1/2 hover:scale-1">
              <input type="checkbox" className="peer sr-only" />
              <p>Show weather info</p>
            </Label>
          </div>
        </div>
      );
    }
  } else {
    return <p>Not working!</p>;
  }
}
