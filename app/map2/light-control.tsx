import { useState } from "react";
import { useMap } from "react-map-gl";

const lights = ["dawn", "day", "dusk", "night"];

export default function LightControl() {
  const { current: map } = useMap();
  const now = new Date();
  const hour = now.getHours();

  const [counter, setCounter] = useState(defineCounter);

  function defineCounter() {
    let presetIndex = 0;
    if (hour > 5 && hour <= 10) {
      presetIndex = 0;
    }
    if (hour > 10 && hour <= 15) {
      presetIndex = 1;
    }
    if (hour > 15 && hour <= 18) {
      presetIndex = 2;
    }
    if (hour > 18 || hour <= 5) {
      presetIndex = 3;
    }
    if (map && map.loaded()) {
      //@ts-ignore
      map.setConfigProperty("basemap", "lightPreset", lights[presetIndex]);
    }
    return presetIndex;
  }

  if (hour > 5 && hour <= 10) {
    counter !== 0 && changeLight(0);
  }
  if (hour > 10 && hour <= 15) {
    counter !== 1 && changeLight(1);
  }
  if (hour > 15 && hour <= 18) {
    counter !== 2 && changeLight(2);
  }
  if (hour > 15 || hour <= 5) {
    counter !== 3 && changeLight(3);
  }

  function changeLight(counter: number) {
    if (map) {
      //@ts-ignore
      map.setConfigProperty("basemap", "lightPreset", lights[counter]);
    }

    setCounter(counter);
  }

  return null;
}
