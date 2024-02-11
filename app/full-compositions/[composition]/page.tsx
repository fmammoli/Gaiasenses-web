import CompositionsInfo, {
  type AvailableCompositionNames,
} from "@/components/compositions/compositions-info";
import FullscreenController from "./fullscreen-controller";

const DEBUG = false;

export default async function Page({
  params,
  searchParams,
}: {
  params: { composition: string };
  searchParams: {
    lat: string;
    lon: string;
    [key: string]: string;
  };
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

      let today = false;
      if (searchParams["today"] && searchParams["today"] === true.toString()) {
        today = true;
      }

      const Component = compositionInfo.Component;
      const props = {
        lat: searchParams.lat,
        lon: searchParams.lon,
        debug: DEBUG,
        ...compositionProps,
        play: play,
        today: today,
      };

      return (
        <div className={`grid grid-rows-1 grid-cols-1 isolate`}>
          <div
            className={`row-start-1 w-full row-end-2 col-start-1 col-end-[-1] bg-background h-[100svh] z-[1] transition-transform [&:has(label>input:checked)]:-translate-y-[16rem] [&:has(label>input:checked)]:rounded-b-[50px] [&:has(label>input:checked)]:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden`}
          >
            <FullscreenController>
              {<Component {...props}></Component> ?? <p>Not working Inside</p>}
            </FullscreenController>
          </div>
        </div>
      );
    }
  } else {
    return <p>Not working!</p>;
  }
}
