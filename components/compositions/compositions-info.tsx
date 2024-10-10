import ChaosTree from "./chaos-tree/chaos-tree";
import CloudBubble from "./cloud-bubble/cloud-bubble";
import ColorFlower from "./color-flower/color-flower";
import Curves from "./curves/curves";
import DigitalOrganism from "./digital-organism/digital-organism";
import GenerativeStrings from "./generative-strings/generative-strings";
import LightningTrees from "./lightning-trees/lightning-trees";
import Lluvia from "./lluvia/lluvia";
import MudflatScatter from "./mudflat-scatter/muflat-scatter";
import PaintBrush from "./paint-brush/paint-brush";
import Rectangles from "./rectangles/rectangles";
import StormEye from "./storm-eye/storm-eye";
import WeatherTree from "./weather-tree/weather-tree";
import Zigzag from "./zigzag/zigzag";
import NightRain from "./night-rain/night-rain";
import WindLines from "./wind-lines/wind-lines";
import LightningBolts from "./lightning-bolts/lightning-bolts";

export type AvailableCompositionNames =
  | "lluvia"
  | "zigzag"
  | "colorFlower"
  | "stormEye"
  | "curves"
  | "chaosTree"
  | "cloudBubble"
  | "digitalOrganism"
  | "paintBrush"
  | "rectangles"
  | "lightningTrees"
  | "weatherTree"
  | "mudflatScatter"
  | "generativeStrings"
  | "nightRain"
  | "windLines"
  | "lightningBolts";

export type AvailableCompositionComponents =
  | typeof Lluvia
  | typeof Zigzag
  | typeof Curves
  | typeof ChaosTree
  | typeof CloudBubble
  | typeof DigitalOrganism
  | typeof PaintBrush
  | typeof Rectangles
  | typeof LightningTrees
  | typeof WeatherTree
  | typeof GenerativeStrings
  | typeof NightRain
  | typeof WindLines
  | typeof LightningBolts;

export type CompositionInfo = {
  name: string;
  attributes: string[];
  Component: AvailableCompositionComponents;
  endpoints: string[];
  thumb: string;
};

export type CompositionsInfoType = {
  [K in AvailableCompositionNames]: CompositionInfo;
};

const CompositionsInfo: CompositionsInfoType = {
  lluvia: {
    name: "lluvia",
    attributes: ["rain"],
    Component: Lluvia,
    endpoints: ["rainfall"],
    thumb: "lluvia.png",
  },
  zigzag: {
    name: "zigzag",
    attributes: ["rain", "lightningCount"],
    Component: Zigzag,
    endpoints: ["rainfall", "lightning"],
    thumb: "zig-zag.png",
  },
  colorFlower: {
    name: "colorFlower",
    attributes: ["temperature"],
    Component: ColorFlower,
    endpoints: [""],
    thumb: "color-flower.png",
  },
  stormEye: {
    name: "stormEye",
    attributes: ["temperature", "windSpeed", "windDeg"],
    Component: StormEye,
    endpoints: [""],
    thumb: "storm-eye.png",
  },
  curves: {
    name: "curves",
    attributes: ["rain", "temperature"],
    Component: Curves,
    endpoints: ["rainfall"],
    thumb: "curves.png",
  },
  chaosTree: {
    name: "chaosTree",
    attributes: ["lat", "lon"],
    Component: ChaosTree,
    endpoints: [""],
    thumb: "chaos-tree.png",
  },
  cloudBubble: {
    name: "cloudBubble",
    attributes: ["clouds"],
    Component: CloudBubble,
    endpoints: ["rainfall"],
    thumb: "cloud-bubble.png",
  },
  digitalOrganism: {
    name: "digitalOrganism",
    attributes: ["rain"],
    Component: DigitalOrganism,
    endpoints: ["rainfall"],
    thumb: "digital-organism.png",
  },
  paintBrush: {
    name: "paintBrush",
    attributes: ["humidity"],
    Component: PaintBrush,
    endpoints: ["rainfall"],
    thumb: "paint-brush.png",
  },
  rectangles: {
    name: "rectangles",
    attributes: ["rain"],
    Component: Rectangles,
    endpoints: ["rainfall"],
    thumb: "rectangles.png",
  },
  lightningTrees: {
    name: "lightningTrees",
    attributes: ["lightningCount"],
    Component: LightningTrees,
    endpoints: ["lightning"],
    thumb: "lightning-trees.png",
  },
  weatherTree: {
    name: "weatherTree",
    attributes: [""],
    Component: WeatherTree,
    endpoints: [""],
    thumb: "weather-tree.png",
  },
  mudflatScatter: {
    name: "mudflatScatter",
    attributes: ["temperature", "windDeg", "windSpeed"],
    Component: MudflatScatter,
    endpoints: [""],
    thumb: "weather-tree.png",
  },
  generativeStrings: {
    name: "generativeStrings",
    attributes: ["temperature", "humidity"],
    Component: GenerativeStrings,
    endpoints: [""],
    thumb: "weather-tree.png",
  },
  nightRain: { 
    name: "nightRain", 
    attributes: ["rain", "temp"], 
    Component: NightRain, 
    endpoints: [""], 
    thumb: "night-rain.png",
  },
  windLines: { 
    name: "windLines", 
    attributes: ["speed"], 
    Component: WindLines, 
    endpoints: [""], 
    thumb: "wind-lines.png",
  },
  lightningBolts: {
    name: "lightningBolts",
    attributes: ["boltCount"],
    Component: LightningBolts,
    endpoints: [""],
    thumb: "lightning-bolts.png",
  },
};

export default CompositionsInfo;
