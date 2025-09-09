"use client";

import { clear, time } from "console";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { LngLatLike, useMap } from "react-map-gl";

type location = {
  name: string;
  coords: LngLatLike | undefined;
  composition: string;
};
const locations: location[] = [
  {
    name: "CTI",
    coords: [-47.12870085542251, -22.851741644263786],
    composition: "zigzag",
  },
  {
    name: "Belfast",
    coords: [-5.925948120326226, 54.59624433531145],
    composition: "stormEye",
  },
  {
    name: "São Paulo",
    coords: [-46.62283272732059, -23.554978262429717],
    composition: "burningTrees",
  },
  {
    name: "Tokyo",
    coords: [139.9118266746732, 35.69322960644536],
    composition: "digitalOrganism",
  },
  {
    name: "Paris",
    coords: [2.349091224739889, 48.85701848772013],
    composition: "mudflatScatter",
  },
  {
    name: "Rio de Janeiro",
    coords: [-43.28570708635095, -22.90166071685915],
    composition: "attractor",
  },
  {
    name: "Brasília",
    coords: [-47.3406054804507, -15.795060704219555],
    composition: "riverLines",
  },
];

export default function AutoInteraction() {
  const { current: map } = useMap();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!map) return;
    let timeout: NodeJS.Timeout | null = null;
    const interval = setInterval(() => {
      let randomIndex = Math.floor(Math.random() * locations.length);

      const currentCenter = map.getCenter();
      if (
        currentCenter.lng === (locations[randomIndex].coords as number[])[0] &&
        currentCenter.lat === (locations[randomIndex].coords as number[])[1]
      ) {
        randomIndex = (randomIndex + 1) % locations.length;
      }

      map.on("moveend", () => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set(
          "lat",
          String((locations[randomIndex].coords as number[])[1])
        );
        newSearchParams.set(
          "lng",
          String((locations[randomIndex].coords as number[])[0])
        );
        newSearchParams.set("mode", "player");
        newSearchParams.set("composition", locations[randomIndex].composition);
        router.replace(pathname + "?" + newSearchParams.toString(), {
          scroll: false,
        });
        timeout = setTimeout(() => {
          newSearchParams.set("mode", "map");
          router.replace(pathname + "?" + newSearchParams.toString(), {
            scroll: false,
          });
        }, 5000);
      });

      map.flyTo({
        center: locations[randomIndex].coords,
        speed: 0.7,
        zoom: 6,
        easing: (t) => t ** 2,
      });
    }, 20000);
    return () => {
      clearInterval(interval);
      timeout ? clearTimeout(timeout) : null;
    };
  }, [map, pathname, router, searchParams]);

  return null;
}
