import CompositionsInfo, {
  CompositionsInfoType,
} from "@/components/compositions/compositions-info";
import ClientMap from "./client-map";
import TitleScreen from "./title-screen";
import FadeContainer from "./fade-container";
import { Suspense } from "react";
import PopupBase from "./popup-base";
import PopupLocationInfo from "./popup-location-info";
import PopupWeatherInfo from "./popup-weather-info";
import PopupButton from "./popup-button";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    lat: string;
    lon: string;
    compositionName: string;
    play: string;
    mode: "composition" | "map";
    initial?: string;
    timed: string;
  };
}) {
  //For cool animation instead of fade, both total container and title screen must have background black.
  //total container can have mix-blend-mode normal and title-screen have mix-blend-mode darken.
  //then I transition title-screeen from black to white, thus transitioning like a fade.

  // Always show the initial title screen except when initial=false is present in search params
  const initial = searchParams.initial === "false" ? false : true;

  const lat = parseFloat(searchParams.lat);
  const lon = parseFloat(searchParams.lon);
  const comps = Object.entries(CompositionsInfo).filter((item) => {
    if (
      item[0] === "zigzag" ||
      item[0] === "stormEye" ||
      item[0] === "curves" ||
      item[0] === "bonfire" ||
      item[0] === "digitalOrganism" ||
      item[0] === "mudflatScatter" ||
      item[0] === "cloudBubble" ||
      item[0] === "paintBrush"
    ) {
      return item;
    }
  });

  return (
    <>
      <div className="grid grid-cols-1 grid-rows-1 min-h-svh">
        <div className="col-start-1 row-start-1">
          <ClientMap
            initialLatitude={Number(searchParams.lat)}
            initialLongitude={Number(searchParams.lon)}
          >
            <Suspense fallback={<h1>loading....</h1>}>
              <PopupBase
                latitude={Number(searchParams.lat)}
                longitude={Number(searchParams.lon)}
              >
                <div className="mb-4">
                  <PopupLocationInfo
                    lat={searchParams.lat}
                    lon={searchParams.lon}
                  />
                  <PopupWeatherInfo
                    lat={searchParams.lat}
                    lon={searchParams.lon}
                  ></PopupWeatherInfo>
                </div>

                <PopupButton compositionName={searchParams.compositionName}>
                  <p>
                    Clique para ver{" "}
                    <span className="capitalize">
                      {searchParams.compositionName}
                    </span>
                  </p>
                </PopupButton>
              </PopupBase>
            </Suspense>
          </ClientMap>
        </div>

        <div className="col-start-1 row-start-1">
          {searchParams.play === "true" && (
            <FadeContainer
              play={searchParams.play === "true" ? true : false}
              mode={searchParams.mode ?? "map"}
            >
              <Suspense fallback={<div className="h-svh bg-black "></div>}>
                {searchParams.compositionName &&
                  CompositionsInfo[
                    searchParams.compositionName as keyof CompositionsInfoType
                  ].Component({
                    lat: searchParams.lat,
                    lon: searchParams.lon,
                    play: searchParams.play == "true" ? true : false,
                    today: true,
                  })}
              </Suspense>
            </FadeContainer>
          )}
        </div>
        <div className="col-start-1 row-start-1">
          {initial && <TitleScreen show={initial}></TitleScreen>}
        </div>
      </div>
    </>
  );
}
