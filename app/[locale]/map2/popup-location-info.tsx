import { reverseGeocode } from "@/components/getData";

export default async function PopupLocationInfo({
  lat,
  lon,
  lang = "pt",
}: {
  lat: string | number;
  lon: string | number;
  lang: string;
}) {
  const reverseGeocodeData = await reverseGeocode(lat, lon);
  if (lang === "en") lang = "en-us";
  if (lang === "pt") lang = "pt-br";

  const regionNames = new Intl.DisplayNames([lang], {
    type: "region",
  });
  if (reverseGeocodeData) {
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
    );
  } else {
    <div>
      <p className="text-lg">Águas Internacionais</p>
    </div>;
  }
}
