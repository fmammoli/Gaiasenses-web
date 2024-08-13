import { Button } from "@/components/ui/button";


import Link from "next/link";

import CompositionsInfo, { CompositionsInfoType } from "@/components/compositions/compositions-info";
import TitleScreen from "../map2/title-screen";
import { getTranslations } from "next-intl/server";
import PopupContent from "../map3/popup-content";
import CompositionModal from "../map3/composition-modal";
import GaiasensesMap from "./gaiasenses-map";


const compositionOptions = [
  "zigzag",
  "stormEye",
  "curves",
  "digitalOrganism",
  "mudflatScatter",
  "cloudBubble",
  "paintBrush",
  "generativeStrings"
  
]
const DEFAULT_COMPOSITION = "stormEye";

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
              <Link href={{query:newQuery}}><Button className="w-full capitalize" variant={"outline"}>{composition}</Button></Link>
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