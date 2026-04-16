import { useCallback, useState } from "react";
import { comps, shuffle } from "./map-constants";
import { getWeather } from "@/components/getData";

export function useCompositionQueue() {
  const [shuffled, setShuffled] = useState<Generator<any>>(() =>
    shuffle([...comps]),
  );

  const getNextComposition = useCallback((): [string, any] => {
    let next = shuffled.next().value;
    if (next === undefined) {
      const newShuffle = shuffle([...comps]);
      next = newShuffle.next().value;
      setShuffled(newShuffle);
    }
    return next;
  }, [shuffled]);

  return { getNextComposition };
}
