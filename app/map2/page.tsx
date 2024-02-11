import CompositionsInfo, {
  CompositionsInfoType,
} from "@/components/compositions/compositions-info";
import ClientMap from "./client-map";

export default async function Page({
  searchParams,
}: {
  searchParams: {
    lat: string;
    lon: string;
    compositionName: string;
    play: string;
    mode: "composition" | "map";
    initial: string;
    timed: string;
  };
}) {
  return (
    <>
      <ClientMap
        mode={searchParams.mode ?? "map"}
        initial={searchParams.initial === "false" ? false : true}
        compositionName={searchParams.compositionName}
        timed={searchParams.timed === "false" ? false : true}
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
      </ClientMap>
    </>
  );
}
