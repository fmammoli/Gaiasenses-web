import { getWeather } from "@/components/getData";
import {
  Cloudy,
  Compass,
  Droplet,
  Thermometer,
  Tornado,
  Wind,
} from "lucide-react";

export default async function PopupWeatherInfo({
  lat,
  lon,
}: {
  lat: string | number;
  lon: string | number;
}) {
  const weatherData = await getWeather(lat, lon);

  return (
    <div className="mt-2 ">
      <p className="text-lg text-pretty capitalize">
        {weatherData.weather[0].description}
      </p>
      <div className="grid grid-cols-3 grid-rows-2 gap-4 mt-2">
        <div className="flex items-end gap-1">
          <Thermometer size={20}></Thermometer>
          <p>{weatherData.main.temp}°C</p>
        </div>

        <div className="flex items-end gap-1">
          <Droplet size={20}></Droplet>
          <p className="">{weatherData.main.humidity}%</p>
        </div>

        <div className="flex items-end gap-1">
          <Cloudy size={20}></Cloudy>
          <p>{weatherData.clouds}%</p>
        </div>

        <div className="flex items-end gap-1">
          <Wind size={20}></Wind>
          <p>{weatherData.wind.speed}m/s</p>
        </div>
        <div className="flex items-end gap-1">
          <Compass size={20}></Compass>
          <p>{weatherData.wind.deg}°</p>
        </div>
        <div className="flex items-end gap-1">
          <Tornado size={20}></Tornado>
          <p>{weatherData.wind.gust}m/s</p>
        </div>
      </div>
    </div>
  );
}
