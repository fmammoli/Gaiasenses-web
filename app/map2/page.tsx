import CompositionsInfo, {
  CompositionsInfoType,
} from "@/components/compositions/compositions-info";
import ClientMap from "./client-map";
import TitleScreen from "./title-screen";
import TitleScreenButton from "./title-screen-button";
import FadeContainer from "./fade-container";
import { Suspense } from "react";

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
  // Always show the initial title screen except when initial=false is present in search params
  const initial = searchParams.initial === "false" ? false : true;

  const comps = Object.entries(CompositionsInfo).filter((item) => {
    if (
      item[0] === "zigzag" ||
      item[0] === "stormEye" ||
      item[0] === "curves" ||
      item[0] === "bonfire" ||
      item[0] === "digitalOrganism" ||
      item[0] === "lightningTrees" ||
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
            mode={searchParams.mode ?? "map"}
            initial={searchParams.initial === "false" ? false : true}
            compositionName={searchParams.compositionName}
            timed={searchParams.timed === "false" ? false : true}
          ></ClientMap>
        </div>

        <div className="col-start-1 row-start-1">
          {searchParams.play === "true" && (
            <FadeContainer play={searchParams.play === "true" ? true : false}>
              {searchParams.compositionName &&
                CompositionsInfo[
                  searchParams.compositionName as keyof CompositionsInfoType
                ].Component({
                  lat: searchParams.lat,
                  lon: searchParams.lon,
                  play: searchParams.play == "true" ? true : false,
                  today: true,
                })}
            </FadeContainer>
          )}
        </div>
        <div className="col-start-1 row-start-1">
          {initial && (
            <TitleScreen show={initial}>
              <TitleScreenButton></TitleScreenButton>
            </TitleScreen>
          )}
        </div>
      </div>
    </>
  );
}
