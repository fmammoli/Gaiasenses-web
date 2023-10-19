import Lluvia from "./visual/lluvia/lluvia";
import Zigzag from "./visual/zigzag/zigzag";

export type AvailableCompositionNames = "lluvia" | "zigzag";
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
};

export default CompositionsInfo;
