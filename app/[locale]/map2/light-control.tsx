import { useCallback, useEffect, useState } from "react";
import { useMap } from "react-map-gl";

const dayPeriodToLightPreset = {
  morning: "dawn",
  afternoon: "day",
  evening: "dusk",
  night: "night",
};
type DayPeriods = "morning" | "afternoon" | "evening" | "night";

//Should probably refactor this as a ui controller using the useControler.
//With an option with auto change
export default function LightControl({
  forceDayPeriod,
}: {
  forceDayPeriod?: DayPeriods;
}) {
  const { current: map } = useMap();

  const [preset, setPreset] = useState(dayPeriodToLightPreset["morning"]);

  const changeLight = useCallback(() => {
    const dayPeriod: DayPeriods = forceDayPeriod
      ? forceDayPeriod
      : (new Intl.DateTimeFormat("en-US", {
          dayPeriod: "long",
          hourCycle: "h12",
        })
          .format(new Date())
          .split(" ")
          .slice(-1)[0] as DayPeriods);

    const newPreset = dayPeriodToLightPreset[dayPeriod];

    if (newPreset !== preset) {
      //@ts-ignore
      map.setConfigProperty("basemap", "lightPreset", newPreset);
      setPreset(newPreset);
    }
  }, [map, forceDayPeriod, preset]);

  useEffect(() => {
    if (map) {
      map.on("style.load", changeLight);
      return () => {
        map.off("style.load", changeLight);
      };
    }
  }, [map, changeLight]);

  if (map?.isStyleLoaded()) {
    changeLight();
  }

  return null;
}
