import { ReactNode, Suspense } from "react"
import PopupLocationInfo from "./popup-location-info"
import PopupWeatherInfo from "./popup-weather-info"

type DataPopupProps = {
    lat:number,
    lng:number,
    lang:string,
    composition?:string,
    children:ReactNode
}

export default async function PopupContent({lat, lng, lang, children}:DataPopupProps){
    return(
      <div>
        <Suspense fallback={<p>Loading Location</p>}>
          <PopupLocationInfo lat={lat} lng={lng} lang={lang}></PopupLocationInfo>
        </Suspense>
        <Suspense fallback={<p>Loading weather info</p>}>
          <PopupWeatherInfo lat={lat} lon={lng} lang={lang}></PopupWeatherInfo>
        </Suspense>
        <div className="mt-4">
          {children}
        </div>
        
      </div>
    )
}