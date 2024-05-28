import CompositionsInfo, {
  CompositionsInfoType,
} from "@/components/compositions/compositions-info";
import ClientMap from "./client-map";
import TitleScreen from "./title-screen";
import FadeContainer from "./fade-container";
import PopupBase from "./popup-base";
import PopupLocationInfo from "./popup-location-info";
import PopupWeatherInfo from "./popup-weather-info";
import PopupButton from "./popup-button";

import { getTranslations } from "next-intl/server";

export default async function Page({
  params,
  searchParams,
}: {
  params: { locale: string };
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
  const t = await getTranslations("Index");

  const initial = searchParams.initial === "false" ? false : true;

  searchParams.lat = searchParams.lat ?? "-22.8258628";
  searchParams.lon = searchParams.lon ?? "-47.0771057";

  const initialShowPopup = searchParams.compositionName && !initial ? true : false

  console.log(initialShowPopup)
  return (
    <div className="grid grid-cols-1 grid-rows-1 min-h-svh">
        <div className="col-start-1 row-start-1">
          <ClientMap
            initialLatitude={Number(searchParams.lat)}
            initialLongitude={Number(searchParams.lon)}
            helpTextOptions={[t("help-text-1"), t("help-text-2")]}
            initialShowPopup={initialShowPopup}
          >
            <PopupBase
              latitude={Number(searchParams.lat)}
              longitude={Number(searchParams.lon)}
            >
              <div className="mb-4">
                <PopupLocationInfo
                  lat={searchParams.lat}
                  lon={searchParams.lon}
                  lang={params.locale}
                />
                <PopupWeatherInfo
                  lat={searchParams.lat}
                  lon={searchParams.lon}
                  lang={params.locale}
                ></PopupWeatherInfo>
              </div>

              <PopupButton compositionName={searchParams.compositionName}>
                <p>
                  {t("compositionButton")}
                  <span className="capitalize">
                    {searchParams.compositionName}
                  </span>
                </p>
              </PopupButton>
            </PopupBase>
          </ClientMap>
        </div>

        <div className="col-start-1 row-start-1">
          {searchParams.play === "true" && (
            <FadeContainer
              play={searchParams.play === "true" ? true : false}
              mode={searchParams.mode ?? "map"}
            >
              {searchParams.compositionName &&
                CompositionsInfo[
                  searchParams.compositionName as keyof CompositionsInfoType
                ].Component({
                  lat: searchParams.lat,
                  lon: searchParams.lon,
                  play: searchParams.play == "true" ? true : false,
                  today: true,
                })}

              {/* fore some reasing this suspense causes a concurrent render of the same context provder */}
              {/* <Suspense
                fallback={<div className="h-svh bg-black "></div>}
              ></Suspense> */}
            </FadeContainer>
          )}
        </div>
        <div className="col-start-1 row-start-1">
          {initial && (
            <TitleScreen
              show={initial}
              title={t("title")}
              subtitle={t("subtitle")}
              titleButtonText={t("titleButtonText")}
            ></TitleScreen>
          )}
        </div>
      </div>
  );
}
