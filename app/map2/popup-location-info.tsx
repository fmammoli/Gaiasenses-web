import { reverseGeocode } from "@/components/getData";

export default async function PopupLocationInfo({
  lat,
  lon,
}: {
  lat: string | number;
  lon: string | number;
}) {
  const reverseGeocodeData = await reverseGeocode(lat, lon);
  const regionNames = new Intl.DisplayNames(["pt-br"], { type: "region" });
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
