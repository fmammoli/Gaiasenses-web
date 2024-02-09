import { useMap } from "react-map-gl";

export default function LightControl(props: any) {
  const { current: map } = useMap();
  const now = new Date();
  let counter = 0;
  const hour = now.getHours();
  if (hour >= 0 && hour <= 5) counter = 3;
  if (hour > 5 && hour <= 10) counter = 1;
  if (hour > 10 && hour <= 16) counter = 2;
  if (hour > 16) counter = 3;

  const lights = ["dawn", "day", "dusk", "night"];
  if (map) {
    setInterval(() => {
      console.log("Setting to: ", lights[counter]);
      //@ts-ignore
      map.setConfigProperty("basemap", "lightPreset", lights[counter]);
      counter === 3 ? (counter = 0) : counter++;
    }, 60000);
  }

  return null;
}
