import PopupLocationInfo from "./popup-location-info";
import PopupWeatherInfo from "./popup-weather-info";

export default async function PopupContent({
  lat,
  lon,
}: {
  lat: string;
  lon: string;
}) {
  return (
    <div className="mb-4">
      <PopupLocationInfo lat={lat} lon={lon} />

      <PopupWeatherInfo lat={lat} lon={lon}></PopupWeatherInfo>
    </div>
  );
}
