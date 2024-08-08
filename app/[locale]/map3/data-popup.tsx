import { getWeather, RainfallResponseData } from "@/components/getData"

type DataPopupProps = {
    lat:number,
    lng:number,
    lang:string
}

export default async function DataPopup({lat, lng, lang}:DataPopupProps){
    
    
    const weather = await getWeather(lat, lng, {lang: lang})
    
    return(
        <div className="bg-slate-400">
            <p>{`Lat: ${lat} | Lng: ${lng}`}</p>
            <pre>{JSON.stringify(weather.main, undefined, 4)}</pre>
        </div>
    )
}