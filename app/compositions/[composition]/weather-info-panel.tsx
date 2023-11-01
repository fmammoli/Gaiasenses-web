import { MoonIcon } from "@radix-ui/react-icons";
import WeatherInfoPanelElement from "./weather-info-panel-element";

const wInfo = [
  { value: "Low", name: "uv index" },
  { name: "rainfall", value: "20mm" },
  { name: "fire change", value: "hight" },
  { name: "satellite visibility", value: "good" },
  { name: "vegetation", value: "dry" },
  { name: "lightning", value: "none" },
];

export default async function WeatherInfoPanel() {
  //  const chunks = splitToNChunks<(typeof wInfo)[0]>(wInfo, wInfo.length / 3);

  return (
    <div className="p-4 mx-auto h-full backdrop-blur-md flex items-end bg-[rgba(255,255,255,0.75)]">
      <div className="w-full max-w-2xl mx-auto">
        <h2 className="font-semibold text-lg uppercase">Campinas - SP</h2>
        <div className="flex justify-between">
          <div>
            <h3 className="font-pop text-[67px] leading-none font-[900] tracking-wider">
              10:38
            </h3>
            <p className="font-semibold tracking-tight">
              {new Date().toLocaleDateString("pt-Br", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="self-center mx-8">
            <MoonIcon height={36} width={36}></MoonIcon>
            <p className="font-mono font-semibold">34°C</p>
          </div>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-2 mt-2">
          {wInfo.map((item) => (
            <WeatherInfoPanelElement
              key={item.name}
              {...item}
            ></WeatherInfoPanelElement>
          ))}
        </div>
      </div>
    </div>
  );
}

function splitToNChunks<T>(array: T[], n: number) {
  let result = [];
  for (let i = n; i > 0; i--) {
    result.push(array.splice(0, Math.ceil(array.length / i)));
  }
  return result;
}
