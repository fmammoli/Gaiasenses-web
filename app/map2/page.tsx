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
    play: boolean;
    mode: "composition" | "map";
  };
}) {
  return (
    <>
      <ClientMap mode={searchParams.mode ?? "map"}>
        {searchParams.mode === "composition" &&
          searchParams.compositionName &&
          CompositionsInfo[
            searchParams.compositionName as keyof CompositionsInfoType
          ].Component({
            lat: searchParams.lat,
            lon: searchParams.lon,
            play: searchParams.play ?? false,
            today: true,
          })}
      </ClientMap>
    </>
  );
}
