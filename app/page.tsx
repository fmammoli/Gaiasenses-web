import { H1 } from "@/components/ui/h1";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvailableCompositionNames } from "@/components/compositions/compositions-info";

import lluviaThumb from "../public/lluvia.png";
import colorFlowerThumb from "../public/color-flower.png";
import zigzagThumb from "../public/zig-zag.png";
import stormEyeThumb from "../public/storm-eye.png";

import {
  RainfallResponseData,
  getWeather,
} from "@/components/compositions/lluvia/lluvia";
import { getLightning } from "@/components/compositions/zigzag/zigzag";
import { Button } from "@/components/ui/button";
import AudioStopper from "./audio-stopper";
import TopBar from "./top-bar";
import LocationBar from "./location-bar";

type CompositionHistoryItem = {
  id: string;
  date: Date;
  description: string;
  composition: AvailableCompositionNames;
  attributes: { [key: string]: string | number }[];
  thumb: StaticImageData;
};

const compositionHistory: CompositionHistoryItem[] = [
  {
    id: "day 4",
    date: new Date("10-24-2023"),
    description: "A warm day with clear sky and some wind.",
    composition: "stormEye",
    attributes: [{ temperature: 32 }, { windSpeed: 4 }, { windDeg: 45 }],
    thumb: stormEyeThumb,
  },
  {
    id: "day 3",
    date: new Date("10-24-2023"),
    description: "A warm day with clear sky.",
    composition: "colorFlower",
    attributes: [{ temperature: 32 }],
    thumb: colorFlowerThumb,
  },
  {
    id: "day 2",
    date: new Date("10-23-2023"),
    description: "A cloudy day with some evening rain.",
    composition: "lluvia",
    attributes: [{ rain: 6 }],
    thumb: lluviaThumb,
  },
  {
    id: "day 1",
    date: new Date("05-10-2023"),
    composition: "zigzag",
    attributes: [{ rain: 20 }, { lightningCount: 20 }],
    description: "A rainy day with lots of lightning",
    thumb: zigzagThumb,
  },
];

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) {
  const newSearchParams = new URLSearchParams(searchParams);
  const lat = newSearchParams.has("lat") ? newSearchParams.get("lat") : null;
  const lon = newSearchParams.has("lon") ? newSearchParams.get("lon") : null;
  let city = newSearchParams.has("city") ? newSearchParams.get("city") : null;

  let weatherData: RainfallResponseData | null = null;
  let temperatureData = 0;
  let rainData = 0;
  let lightningCountData = 0;
  let windSpeedData = 0;
  let windDegData = 0;
  let error = null;
  let state = null;

  if (lat && lon) {
    try {
      weatherData = await getWeather(lat, lon);

      temperatureData = weatherData.main.temp;

      rainData = weatherData.rain.hasOwnProperty("1h")
        ? (weatherData.rain as { "1h": number })["1h"]
        : 0;

      windSpeedData = weatherData.wind.speed;
      windDegData = weatherData.wind.deg;
      city = weatherData.city;
      state = weatherData.state;
      const lightningData = getLightning(lat, lon, 50);
      lightningCountData = (await lightningData).count;
    } catch (error) {
      console.log(error);
      error = error;
      alert(error);
    }
  }

  return (
    <main className="grid grid-rows-[auto_1fr] h-full justify-center">
      <AudioStopper></AudioStopper>
      <TopBar>
        <LocationBar city={city} state={state}></LocationBar>
      </TopBar>

      <div className="p-8">
        <p>{`Lat: ${lat}City:${city}`}</p>
        <p>{`Lon:${lon}`}</p>
        <p>{`City:${city}`}</p>
        <p>{`Geo Middle:${newSearchParams.get("geo")}`}</p>
        <p className="max-w-xs break-words">{`searh params:${JSON.stringify(
          searchParams
        )}`}</p>
        <H1>My compositons</H1>

        <div className="my-4 max-w-sm">
          <Card className="shadow-sm hover:shadow-md hover:scale-[102%] transition-shadow">
            <CardHeader>
              <CardTitle>
                Today - {error} {weatherData?.city}, {weatherData?.state}
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("pt-Br", {
                  weekday: "short",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-lg capitalize">
                  {weatherData?.weather[0].description}
                </p>
              </div>
              <div className="grid grid-rows-3 grid-cols-3 text-xs gap-3">
                <div>Temp: {temperatureData}</div>
                <div>Feels like: {weatherData?.main.feels_like}</div>
                <div>Humidity: {weatherData?.main.humidity}</div>
                <div>Clouds: {weatherData?.clouds}</div>
                <div>Rain 1h: {rainData}</div>
                <div>Lightning Count: {lightningCountData}</div>
                <div>Wind Speed: {weatherData?.wind.speed}</div>
                <div>Wind Gust: {weatherData?.wind.gust}</div>
                <div>Wind Deg: {weatherData?.wind.deg}</div>
                <div>Visibility: {weatherData?.visibility}</div>
              </div>
              <div className="mt-4">
                <p className="text-sm">
                  Create a new composition based on today weather:
                </p>
              </div>
            </CardContent>
            <CardFooter className="gap-1 flex-wrap">
              <Button variant={"outline"} className="text-sm" asChild>
                <Link
                  href={`/compositions/lluvia/?lat=${lat}&lon=${lon}&rain=${rainData}&play=false`}
                  scroll={false}
                >
                  Lluvia
                </Link>
              </Button>
              <Button className="text-sm" variant={"outline"} asChild>
                <Link
                  href={`/compositions/zigzag/?lat=${lat}&lon=${lon}&rain=${rainData}&lightningCount=${lightningCountData}&play=false`}
                  scroll={false}
                >
                  ZigZag
                </Link>
              </Button>

              <Button className="text-sm" variant={"outline"} asChild>
                <Link
                  href={`/compositions/colorFlower/?lat=${lat}&lon=${lon}&temperature=${temperatureData}&play=false`}
                  scroll={false}
                >
                  Color Flower
                </Link>
              </Button>

              <Button className="text-sm" variant={"outline"} asChild>
                <Link
                  href={`/compositions/stormEye/?lat=${lat}&lon=${lon}&windSpeed=${windSpeedData}&windDeg=${windDegData}&temperature=${temperatureData}&play=false`}
                  scroll={false}
                >
                  Storm Eye
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {compositionHistory.map((item, index) => {
          const attributesString = item.attributes
            .map((attr) => {
              return `${Object.keys(attr)[0]}=${attr[Object.keys(attr)[0]]}`;
            })
            .join("&");

          return (
            <div key={item.id} className="my-4 max-w-sm">
              <Link
                href={`/compositions/${item.composition}/?lat=${lat}&lon=${lon}&${attributesString}&play=false`}
                scroll={false}
              >
                <Card className="shadow-sm hover:shadow-md hover:scale-[102%] transition-shadow">
                  <CardHeader>
                    <CardTitle className="capitalize">{`${item.id} - ${item.composition}`}</CardTitle>
                    <CardDescription>
                      {item.date.toLocaleDateString("pt-Br", {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Image src={item.thumb} alt={""}></Image>
                    <p>{item.description}</p>
                    <div>
                      {item.attributes.map((item, index) => (
                        <p key={index}>{JSON.stringify(item)}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
