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
  lang = "pt",
}: Readonly<{
  lat: string | number;
  lon: string | number;
  lang: string;
}>) {
  //const weatherData = await getWeather(lat, lon, { lang: lang });

  const weatherData = {
    city: "Open Weather API",
    clouds: 30,
    lat: 0,
    lon: 0,
    main: {
      feels_like: 24,
      humidity: 30,
      pressure: 20,
      temp: 24,
      grnd_level: 0,
    },
    rain: {},
    state: "Open weather API",

    visibility: 100,
    weather: [
      {
        description: "indisponível",
        icon: "indisponível",
        main: "indisponível",
      },
    ],
    wind: {
      deg: 90,
      gust: 40,
      speed: 30,
    },
  };

  return (
    <div className="mt-2 ">
      <p className="text-lg text-pretty capitalize">
        {weatherData.weather[0].description ?? "indisponível"}
      </p>
      <div className="grid grid-cols-3 grid-rows-2 gap-4 mt-2">
        <div className="flex items-end gap-1">
          <Thermometer size={20}></Thermometer>
          <p>{weatherData.main.temp ?? "indisponível"}°C</p>
        </div>

        <div className="flex items-end gap-1">
          <Droplet size={20}></Droplet>
          <p className="">{weatherData.main.humidity ?? "indisponível"}%</p>
        </div>

        <div className="flex items-end gap-1">
          <Cloudy size={20}></Cloudy>
          <p>{weatherData.clouds ?? "indisponível"}%</p>
        </div>

        <div className="flex items-end gap-1">
          <Wind size={20}></Wind>
          <p>{weatherData.wind.speed ?? "indisponível"}m/s</p>
        </div>
        <div className="flex items-end gap-1">
          <Compass size={20}></Compass>
          <p>{weatherData.wind.deg}°</p>
        </div>
        <div className="flex items-end gap-1">
          <Tornado size={20}></Tornado>
          <p>{weatherData.wind.gust ?? "indisponível"}m/s</p>
        </div>
      </div>
    </div>
  );
}
