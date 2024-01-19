import { getWeather } from "@/components/getData";
import WeatherInfoPanelElement from "./weather-info-panel-element";

export default async function WeatherInfoData({
  lat,
  lon,
}: {
  lat: string;
  lon: string;
}) {
  const data = await getWeather(lat.toString(), lon.toString());

  const weatherInfo = {
    rainfall: data.rain.hasOwnProperty("1h")
      ? (data.rain as { "1h": number })["1h"]
      : 0,
    humidity: data.main.humidity,
    clouds: data.clouds,
    feelsLike: data.main.feels_like,
    grndLeve: data.main.grnd_level,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    windGust: data.wind.gust,
    visibility: data.visibility,
    weather: data.weather[0].description,
  };

  return (
    <>
      {Object.entries(weatherInfo).map((item) => {
        <WeatherInfoPanelElement
          key={item[0]}
          name={item[0]}
          value={item[1]}
        ></WeatherInfoPanelElement>;
      })}
    </>
  );
}
