import { Button } from "@/components/ui/button";
import GaiasensesMap from "./gaiasenses-map";
import PopupContent from "./popup-content";
import Link from "next/link";
import CompositionModal from "./composition-modal";
import CompositionsInfo, {
  CompositionsInfoType,
} from "@/components/compositions/compositions-info";
import TitleScreen from "./title-screen";
import { getTranslations } from "next-intl/server";
import { CompositionDropdown } from "./composition-dropdown";
import InfoModal from "./info-modal";

function stringToBoolean(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  switch (value.toLowerCase().trim()) {
    case "true":
    case "yes":
    case "1":
      return true;
    case "false":
    case "no":
    case "0":
    case null:
      return false;
    default:
      return false;
  }
}

const compositionOptions = Object.entries(CompositionsInfo).map(
  (item) => item[0]
);
// const compositionOptions = [
//   "zigzag",
//   "stormEye",
//   "curves",
//   "digitalOrganism",
//   "mudflatScatter",
//   "cloudBubble",
//   "paintBrush",
//   "generativeStrings",
//   "nightRain",
//   "windLines",
//   "lightningBolts",
//   "burningTrees"
// ]
const DEFAULT_COMPOSITION = "nightRain";

type PageProps = {
  params: { locale: string; url: string };
  searchParams: {
    lat?: string;
    lng?: string;
    composition?: string;
    mode?: string;
    info?: string;
  };
};

export default async function Page({ params, searchParams }: PageProps) {
  const t = await getTranslations("Index");

  let composition = "";
  if (
    searchParams.composition &&
    compositionOptions.includes(searchParams.composition)
  ) {
    composition = searchParams.composition;
  } else {
    composition = DEFAULT_COMPOSITION;
  }
  const lat = parseFloat(searchParams.lat ?? "0");
  const lng = parseFloat(searchParams.lng ?? "0");

  const newQuery = {
    ...searchParams,
    composition: composition,
    mode: "player",
  };
  const compositionComponent = CompositionsInfo[
    composition as keyof CompositionsInfoType
  ].Component({
    lat: lat.toString(),
    lon: lng.toString(),
    today: true,
    play: true,
  });

  const isInfoOpen = stringToBoolean(searchParams.info);

  return (
    <div className="grid grid-cols-1 grid-rows-1">
      <div className="col-start-1 row-start-1 isolate">
        <GaiasensesMap
          initialLat={lat}
          initialLng={lng}
          InfoButtonText={t("infoButtonText")}
        >
          <PopupContent lat={lat} lng={lng} lang={params.locale}>
            <div className="flex gap-1">
              <Link href={{ query: newQuery }} className="w-full">
                <Button className="w-full capitalize" variant={"outline"}>
                  {composition}
                </Button>
              </Link>
              <CompositionDropdown
                searchParams={searchParams}
              ></CompositionDropdown>
            </div>
          </PopupContent>
        </GaiasensesMap>
      </div>
      <div className="col-start-1 row-start-1">
        <TitleScreen
          show={true}
          title={t("title")}
          subtitle={""}
          titleButtonText={t("titleButtonText")}
        ></TitleScreen>
      </div>

      <CompositionModal
        isOpen={searchParams.mode === "player" ? true : false}
        closeButton={
          <Link href={{ query: { ...newQuery, mode: "map" } }}>
            <Button>Back</Button>
          </Link>
        }
      >
        {compositionComponent}
      </CompositionModal>
      <InfoModal
        isOpen={isInfoOpen}
        closeButton={
          <Link href={{ query: { ...searchParams, info: false } }} replace>
            X
          </Link>
        }
      >
        <div className="max-w-lg flex flex-col gap-4 pb-8 text-lg text-justify mx-auto">
          <h1 className="text-5xl font-bold text-center py-12">GaiaSenses</h1>

          <p>{t("aboutTextp1")}</p>

          <h2 className="text-2xl font-bold">{t("creditsText")}</h2>

          <div>
            <p className="font-bold">{t("ctiText")}</p>
            <p className="italic">{t("discfText")}</p>
          </div>

          <div>
            <p className="font-bold">{t("coordinatorText")}</p>
            <p>Artemis Moroni</p>
          </div>

          <div>
            <p className="font-bold">{t("development")}</p>
            <p>Lucas de Oliveira</p>
            <p>Henrique Cazarim</p> <p>Alvaro Costa</p>
            <p>Pedro Trama</p> <p>Felipe Mammoli</p>
          </div>

          <div>
            <p className="font-bold">{t("sound")}</p>
            <p>Gabriel Dincao</p> <p>Laureana Stelmastchuk</p>
          </div>

          <div>
            <p className="font-bold">{t("compositionCredits")}</p>
            {Object.entries(CompositionsInfo).map((value, index) => (
              <div className="flex" key={index}>
                <Link
                  className={`hover:underline ${
                    value[1].openProcessingLink ? "" : "pointer-events-none"
                  }`}
                  href={value[1].openProcessingLink ?? ""}
                  aria-disabled={value[1].openProcessingLink ? false : true}
                  target="blank"
                >
                  {value[1].name}, <span>{value[1].author}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </InfoModal>
    </div>
  );
}
