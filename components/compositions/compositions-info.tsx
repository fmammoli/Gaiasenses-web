import ColorFlower from "./visual/color-flower/color-flower";
import Lluvia from "./visual/lluvia/lluvia";
import StormEye from "./visual/storm-eye/storm-eye";
import Zigzag from "./visual/zigzag/zigzag";

export type AvailableCompositionNames =
  | "lluvia"
  | "zigzag"
  | "colorFlower"
  | "stormEye";
export type AvailableCompositionComponents = typeof Lluvia | typeof Zigzag;

type CompositionsInfo = {
  [K in AvailableCompositionNames]: {
    name: string;
    attributes: string[];
    Component: AvailableCompositionComponents;
    endpoints: string[];
  };
};

const CompositionsInfo: CompositionsInfo = {
  lluvia: {
    name: "lluvia",
    attributes: ["rain"],
    Component: Lluvia,
    endpoints: ["rainfall"],
  },
  zigzag: {
    name: "zigzag",
    attributes: ["rain", "lightningCount"],
    Component: Zigzag,
    endpoints: ["rainfall", "lightning"],
  },
  colorFlower: {
    name: "colorFlower",
    attributes: ["temperature"],
    Component: ColorFlower,
    endpoints: [""],
  },
  stormEye: {
    name: "stormEye",
    attributes: ["temperature", "windSpeed", "windDeg"],
    Component: StormEye,
    endpoints: [""],
  },
};

export default CompositionsInfo;
