import { MoonIcon } from "@radix-ui/react-icons";
import WeatherInfoPanelElement from "./weather-info-panel-element";
import { getWeather } from "@/components/getData";
import LightningInfo from "./lightning-info";
import FireInfo from "./fire-info";
import { ReactNode } from "react";

const wInfo = [
  { value: "Low", name: "uv index" },
  { name: "rainfall", value: "20mm" },
  { name: "fire change", value: "hight" },
  { name: "satellite visibility", value: "good" },
  { name: "vegetation", value: "dry" },
  { name: "lightning", value: "none" },
];

export default async function WeatherInfoPanel({
  lat,
  lon,
  mode,
  children,
}: {
  lat: string | number;
  lon: string | number;
  mode?: "spaced" | "compact";
  children?: ReactNode;
}) {
  try {
    const data = await getWeather(lat.toString(), lon.toString());
    const weatherInfo = {
      weather: data.weather[0].description,
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
    };
    return (
      <div
        className={`${
          mode === "spaced" ? "p-4" : ""
        } mx-auto h-full backdrop-blur-md  bg-[rgba(255,255,255,0.75)]`}
      >
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex justify-between">
            {mode === "spaced" && (
              <h3
                className={`font-pop text-[67px] leading-none font-[900] tracking-wider`}
              >
                10:38
              </h3>
            )}
            <div>
              <div>
                <h2 className="font-semibold text-lg uppercase">{data.city}</h2>
                <h3 className="font-medium text-md">{data.state}</h3>
                <p className="font-semibold tracking-tight">
                  {new Date().toLocaleDateString("pt-Br", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="self-center mx-8">
              <MoonIcon height={36} width={36}></MoonIcon>
              <p className="font-mono font-semibold">{data.main.temp}°C</p>
            </div>
          </div>
          <div
            className={`${
              mode === "spaced" ? "gap-2 mt-2" : ""
            }grid grid-cols-3 grid-rows-2 gap-2 mt-2`}
          >
            {Object.entries(weatherInfo).map((item) => (
              <WeatherInfoPanelElement
                key={item[0]}
                name={item[0]}
                value={item[1]}
              ></WeatherInfoPanelElement>
            ))}
          </div>
          <div className="mb-4">
            <LightningInfo
              lat={lat.toString()}
              lon={lon.toString()}
            ></LightningInfo>
          </div>
          <div>
            <FireInfo lat={lat.toString()} lon={lon.toString()}></FireInfo>
          </div>
        </div>

        {children}
      </div>
    );
  } catch (error) {
    return (
      <div>
        <p className="text-center my-4">This location is not supported yet.</p>
      </div>
    );
  }
}
