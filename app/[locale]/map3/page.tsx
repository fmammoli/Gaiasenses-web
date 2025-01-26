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
//   "lightningBolts"
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
        <GaiasensesMap initialLat={lat} initialLng={lng}>
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
        <div className="max-w-96 flex flex-col gap-4 pb-8 text-lg text-justify mx-auto">
          <h1 className="text-6xl font-bold text-center py-12">GaiaSenses</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non
            pretium sem. Donec efficitur gravida semper. Ut at sollicitudin ex.
            Vestibulum mauris nibh, cursus et congue et, consectetur in libero.
            Nunc sodales mattis lorem, eget lobortis libero tincidunt et.
            Phasellus ullamcorper vestibulum tellus eu consequat. Suspendisse
            ultricies nisl ut ante congue scelerisque. Quisque in lectus sit
            amet ipsum egestas euismod ut sit amet ante. Pellentesque fermentum
            imperdiet velit, nec dapibus elit vehicula eu. Donec suscipit
            convallis feugiat. Vivamus sed nunc odio. Ut elit lectus, suscipit
            ac justo posuere, sollicitudin dapibus ex. Suspendisse lobortis
            pretium efficitur. Curabitur in eros consectetur, vehicula sapien
            at, accumsan enim. Vestibulum consequat imperdiet dolor, nec tempor
            urna mattis quis.
          </p>

          <p>
            Etiam dapibus luctus laoreet. In hac habitasse platea dictumst. Sed
            elit nibh, pulvinar eget rhoncus ac, dignissim quis nulla. Integer
            elit orci, accumsan maximus dictum sed, rutrum vel dui. Praesent
            euismod sapien non neque suscipit elementum. Etiam pretium sodales
            lorem, in consequat nunc. Vestibulum nec velit euismod, vulputate
            enim ut, egestas tellus. Aenean consequat lorem ultrices turpis
            sollicitudin congue. Nam varius quis leo a elementum. Vivamus eros
            nibh, dictum ut blandit eget, ornare non felis.
          </p>

          <p>
            Pellentesque pharetra vel arcu sed ornare. Donec tortor nisi,
            vehicula eu lacinia a, dictum a augue. Proin vitae tempor lorem.
            Aliquam erat volutpat. Nunc accumsan urna vitae augue placerat
            congue. In hac habitasse platea dictumst. Nullam iaculis, justo ac
            laoreet vulputate, lectus nulla scelerisque velit, id euismod mi
            metus id arcu. Vivamus at varius risus. Aliquam scelerisque enim at
            tempus pulvinar. Donec a ornare ipsum.
          </p>

          <h2 className="text-2xl font-bold">Credits</h2>

          <div>
            <p className="font-bold">
              Institute of Information Technology - Renato Archer
            </p>
            <p className="italic">Cyberphysical Systems Laboratory</p>
          </div>

          <div>
            <p className="font-bold">Coordination:</p> <p>Artemis Moroni</p>
          </div>

          <div>
            <p className="font-bold">Platform Development:</p>{" "}
            <p>Lucas de Oliveira</p>
            <p>Henrique Cazarim</p> <p>Alvaro Costa</p>
            <p>Pedro Trama</p> <p>Felipe Mammoli</p>
          </div>

          <div>
            <p className="font-bold">Sound Development:</p>{" "}
            <p>Gabriel Dincao</p> <p>Laureana Stelmastchuk</p>
          </div>
        </div>
      </InfoModal>
    </div>
  );
}
