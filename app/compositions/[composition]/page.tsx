import CompositionsInfo, {
  AvailableCompositionNames,
} from "@/components/compositions/compositions-info";
import WeatherInfoPanel from "./weather-info-panel";

export type FireSpotsResponseData = {
  city: string;
  count: number;
  events: [];
  state: string;
};

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
        debug: true,
        ...compositionProps,
        play: play,
      };

      return (
        <div className="grid grid-rows-1 grid-cols-1 bg-[url(/lluvia.png)] isolate">
          <div className="row-start-1 row-end-2 col-start-1 col-end-[-1]">
            <WeatherInfoPanel></WeatherInfoPanel>
          </div>
          <div
            className={`row-start-1 w-full row-end-2 col-start-1 col-end-[-1] h-[100svh] z-[1] bg-background transition-transform ${
              !play && "-translate-y-[35%]  rounded-b-[50px]"
            } shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]`}
          >
            {<Component {...props}></Component> ?? <p>Not working Inside</p>}
          </div>
        </div>
      );
    }
  } else {
    return <p>Not working!</p>;
  }
}
