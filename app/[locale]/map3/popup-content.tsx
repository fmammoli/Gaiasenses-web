import { ReactNode, Suspense } from "react"
import PopupLocationInfo from "./popup-location-info"
import PopupWeatherInfo from "./popup-weather-info"
import PopupLoading from "./popup-loading"

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
        <Suspense fallback={<PopupLoading></PopupLoading>}>
          <PopupLocationInfo lat={lat} lng={lng} lang={lang}></PopupLocationInfo>
          <PopupWeatherInfo lat={lat} lon={lng} lang={lang}></PopupWeatherInfo>
          <div className="mt-4">
            {children}
          </div>
        </Suspense>
        
      </div>
    )
}