import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ViewStateChangeEvent, MapRef } from "react-map-gl";
import { locations } from "./map-constants";

const TIMEOUT_1_PAUSE = 5000;
const TIMEOUT_2_PAUSE = 20000;
const TIMEOUT_3_PAUSE = 5000;

export function useAutoMode(mapRef: React.RefObject<MapRef>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [autoActive, setAutoActive] = useState(false);
  const [autoLocationIndex, setAutoLocationIndex] = useState(0);

  const timeout1 = useRef<NodeJS.Timeout | null>(null);
  const timeout2 = useRef<NodeJS.Timeout | null>(null);
  const timeout3 = useRef<NodeJS.Timeout | null>(null);

  const onAutoActivateToggle = useCallback((state: boolean) => {
    console.log(`Setting automode: ${state}`);
    setAutoActive(state);
    if (!state) {
      if (timeout1.current) clearTimeout(timeout1.current);
      if (timeout2.current) clearTimeout(timeout2.current);
      if (timeout3.current) clearTimeout(timeout3.current);
    }
  }, []);

  const onMoveEndAuto = useCallback(
    (_e: ViewStateChangeEvent) => {
      const [lng, lat] = locations[autoLocationIndex].coords;
      console.log("Auto move end, ", autoActive);
      timeout1.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", lat.toString());
        params.set("lng", lng.toString());
        params.set("mode", "player");
        params.set("composition", locations[autoLocationIndex].composition);
        router.replace(`${pathname}?${params.toString()}`);
        timeout2.current = setTimeout(() => {
          params.set("mode", "map");
          router.replace(`${pathname}?${params.toString()}`);
          timeout3.current = setTimeout(() => {
            setAutoLocationIndex((prev) => {
              const next = prev + 1;
              return next > locations.length - 1 ? 0 : next;
            });
          }, TIMEOUT_3_PAUSE);
        }, TIMEOUT_2_PAUSE);
      }, TIMEOUT_1_PAUSE);
    },
    [autoLocationIndex, autoActive, pathname, searchParams, router],
  );

  useEffect(() => {
    if (autoActive) {
      mapRef.current?.flyTo({
        center: locations[autoLocationIndex].coords,
        speed: 0.7,
        zoom: 4,
        easing: (t) => t ** 2,
      });
    }
  }, [autoActive, autoLocationIndex, mapRef]);

  return { autoActive, onAutoActivateToggle, onMoveEndAuto };
}
