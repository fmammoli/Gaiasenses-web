import { reverseGeocode } from "@/components/getData";

type PopupLocationInfoProps = {
    lat:number,
    lng:number,
    lang:string,
}

export default async function PopupLocationInfo({lat, lng, lang}:PopupLocationInfoProps){

    const reverseGeocodeData = await reverseGeocode(lat, lng);
    if (lang === "en") lang = "en-us";
    if (lang === "pt") lang = "pt-br";
  
    const regionNames = new Intl.DisplayNames([lang], {
      type: "region",
    });
    return (
        <div>
        <p className="text-lg">
          {reverseGeocodeData?.name},{" "}
          <span className="font-normal">{reverseGeocodeData?.state}</span>
        </p>
        <p className="font-bold text-lg">
          {reverseGeocodeData?.country
            ? regionNames.of(reverseGeocodeData.country)
            : ""}
        </p>
      </div>
    )
}