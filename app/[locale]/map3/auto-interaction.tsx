"use client";

import { clear, time } from "console";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

type AutoInteractionProps = {
  isIdle: boolean;
};

export default function UseAutoInteraction() {
  const { current: map } = useMap();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [timeoutId1, setTimeoutId1] = useState<NodeJS.Timeout | null>(null);
  const [timeoutId2, setTimeoutId2] = useState<NodeJS.Timeout | null>(null);

  console.log("alooo");
  useEffect(() => {
    if (!map)
      return () => {
        clearTimeout(timeoutId1!);
        clearTimeout(timeoutId2!);
      };

    //clearTimeout(timeoutId!);
    console.log("Run autoInteraction");

    let randomIndex = Math.floor(Math.random() * locations.length);

    const currentCenter = map.getCenter();
    if (
      currentCenter.lng === (locations[randomIndex].coords as number[])[0] &&
      currentCenter.lat === (locations[randomIndex].coords as number[])[1]
    ) {
      randomIndex = (randomIndex + 1) % locations.length;
    }

    const onMoveEnd = async () => {
      console.log("map moved end 2");

      //if (timeoutId1) clearTimeout(timeoutId1);
      //if (timeoutId2) clearTimeout(timeoutId2);

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set(
        "lat",
        String((locations[randomIndex].coords as number[])[1])
      );
      newSearchParams.set(
        "lng",
        String((locations[randomIndex].coords as number[])[0])
      );

      const timeout1 = setTimeout(() => {
        newSearchParams.set("mode", "player");
        newSearchParams.set("composition", locations[randomIndex].composition);
        console.log("composition!!!!!!");
        router.replace(pathname + "?" + newSearchParams.toString(), {
          scroll: false,
        });
      }, 10000);
      setTimeoutId1(timeout1);

      // const timeout2 = setTimeout(() => {
      //   newSearchParams.set("mode", "map");
      //   router.replace(pathname + "?" + newSearchParams.toString(), {
      //     scroll: false,
      //   });
      // }, 15000);
      // setTimeoutId2(timeout2);
    };

    map.once("moveend", onMoveEnd);

    map.flyTo({
      center: locations[randomIndex].coords,
      speed: 0.7,
      zoom: 4,
      easing: (t) => t ** 2,
    });

    return () => {
      timeoutId1 ? clearTimeout(timeoutId1) : null;
      timeoutId2 ? clearTimeout(timeoutId2) : null;
      //map.off("moveend", onMoveEnd);
    };
  }, [map, pathname, router, searchParams, timeoutId1, timeoutId2]);

  return null;
}
