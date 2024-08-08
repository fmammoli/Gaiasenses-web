import CompositionsInfo from "@/components/compositions/compositions-info";
import { getWeather, RainfallResponseData } from "@/components/getData";
import DataPopup from "./data-popup";
import { Suspense } from "react";


const compositionOptions = [
    "zigZag",
    "stormEye",
    "curves",
    "bonfire",
    "digitalOrganism",
    "mudflatScatter",
    "cloudBubble",
    "paintBrush",
    "generativeStrings"
    
]
const DEFAULT_COMPOSITION = "curves";

type PageProps = {
    params: {locale:string},
    searchParams:{
        lat?:string,
        lng?:string,
        composition?:string
    }
}

export default async function Page({params, searchParams}:PageProps){
    
    let composition = "";
    if(searchParams.composition && compositionOptions.includes(searchParams.composition)){
        composition = searchParams.composition;
    } else {
        composition = DEFAULT_COMPOSITION;
    }
    
    const newParams = structuredClone(searchParams)
    newParams.composition = composition;

   
    
    return (
        <>
            <div>{JSON.stringify(params)}</div>
            <div>{JSON.stringify(newParams)}</div>
            
            <Suspense fallback={<p>Loading...</p>}>
                {
                    searchParams.lat && 
                    searchParams.lng &&
                    <DataPopup lang={params.locale} lat={parseFloat(searchParams.lat)} lng={parseFloat(searchParams.lng)}></DataPopup>
                }
            </Suspense>    
        </>
    )
}