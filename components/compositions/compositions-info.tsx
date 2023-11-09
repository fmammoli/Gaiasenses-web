import Bonfire from "./bonfire/bonfire";
import ChaosTree from "./chaos-tree/chaos-tree";
import ColorFlower from "./color-flower/color-flower";
import Curves from "./curves/curves";
import Lluvia from "./lluvia/lluvia";
import StormEye from "./storm-eye/storm-eye";
import Zigzag from "./zigzag/zigzag";

export type AvailableCompositionNames =
  | "lluvia"
  | "zigzag"
  | "colorFlower"
  | "stormEye"
  | "curves"
  | "bonfire"
  | "chaosTree";

export type AvailableCompositionComponents =
  | typeof Lluvia
  | typeof Zigzag
  | typeof Curves
  | typeof Bonfire
  | typeof ChaosTree;

type CompositionsInfo = {
  [K in AvailableCompositionNames]: {
    name: string;
    attributes: string[];
    Component: AvailableCompositionComponents;
    endpoints: string[];
    thumb: string;
  };
};

const CompositionsInfo: CompositionsInfo = {
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
  bonfire: {
    name: "bonfire",
    attributes: ["fireCount"],
    Component: Bonfire,
    endpoints: ["fire"],
    thumb: "bonfire.png",
  },
  chaosTree: {
    name: "chaosTree",
    attributes: ["lat", "lon"],
    Component: ChaosTree,
    endpoints: [""],
    thumb: "chaos-tree.png",
  }
};

export default CompositionsInfo;
