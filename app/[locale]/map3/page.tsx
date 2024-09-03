import { Button } from "@/components/ui/button";
import GaiasensesMap from "./gaiasenses-map";
import PopupContent from "./popup-content";
import Link from "next/link";
import CompositionModal from "./composition-modal";
import CompositionsInfo, { CompositionsInfoType } from "@/components/compositions/compositions-info";
import TitleScreen from "../map2/title-screen";
import { getTranslations } from "next-intl/server";
import { CompositionDropdown } from "./composition-dropdown";

const compositionOptions = Object.entries(CompositionsInfo).map(item => item[0])
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
//   "windLines"
  
// ]
const DEFAULT_COMPOSITION = "nightRain";

type PageProps = {
    params: {locale:string, url:string},
    searchParams:{
        lat?:string,
        lng?:string,
        composition?:string,
        mode?:string
    },
}

export default async function Page({params, searchParams}:PageProps){
    
    const t = await getTranslations("Index");
   
    let composition = "";
    if(searchParams.composition && compositionOptions.includes(searchParams.composition)){
        composition = searchParams.composition;
    } else {
        composition = DEFAULT_COMPOSITION;
    }
    const lat = parseFloat(searchParams.lat ?? "0");
    const lng = parseFloat(searchParams.lng ?? "0");

    const newQuery = {...searchParams, composition:composition, mode:"player"};
    const compositionComponent = CompositionsInfo[composition as keyof CompositionsInfoType].Component({lat:lat.toString(), lon:lng.toString(), today:true, play:true});

    
    return (
      <div className="grid grid-cols-1 grid-rows-1">
        <div className="col-start-1 row-start-1 isolate">
          <GaiasensesMap initialLat={lat} initialLng={lng}>
            <PopupContent
              lat={lat}
              lng={lng}
              lang={params.locale}
            >
              <div className="flex gap-1">
                <Link href={{query:newQuery}} className="w-full">
                  <Button className="w-full capitalize" variant={"outline"}>
                    {composition}
                  </Button>
                </Link>
                <CompositionDropdown searchParams={searchParams}></CompositionDropdown>
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
          closeButton={<Link href={{query:{...newQuery, mode:"map"}}}><Button>Back</Button></Link>}
        >
          {compositionComponent}
        </CompositionModal>

        
      </div>
    )
}