"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useState,
} from "react";
import { Marker, type MarkerDragEvent } from "react-map-gl";
import CompositionsInfo from "@/components/compositions/compositions-info";

function* shuffle(array: any[]) {

  var i = array.length;

  while (i--) {
      const rand = Math.random() * (i+1)
      console.log(rand)
      yield array.splice(Math.floor(rand), 1)[0];
  }

}

const comps = Object.entries(CompositionsInfo).filter((item) => {
  if (
    item[0] === "zigzag" ||
    item[0] === "stormEye" ||
    item[0] === "curves" ||
    item[0] === "bonfire" ||
    item[0] === "digitalOrganism" ||
    item[0] === "mudflatScatter" ||
    item[0] === "cloudBubble" ||
    item[0] === "paintBrush" ||
    item[0] === "generativeStrings"
  ) {
    return item;
  }
});


export default function MarkerBase({
  children,
  latitude,
  longitude,
  setMarker,
  setShowPopup,
}: {
  latitude: number;
  longitude: number;
  children?: ReactNode;
  setMarker: Dispatch<
    SetStateAction<{
      latitude: number;
      longitude: number;
    }>
  >;
  setShowPopup: Dispatch<SetStateAction<boolean>>;
}) {
  
  const [shuffled, setShuffled] = useState(shuffle([...comps]))
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const onMarkerDragStart = useCallback(
    (event: MarkerDragEvent) => {
      setShowPopup(false);
    },
    [setShowPopup]
  );

  const onMarkerDrag = useCallback(
    (event: MarkerDragEvent) => {
      // logEvents((_events) => ({ ..._events, onDrag: event.lngLat as LngLat }));

      //Wrap longitude in -180/180 range.
      const lngLat = event.lngLat.wrap();
      setMarker({
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      });
    },
    [setMarker]
  );

  const onMarkerDragEnd = useCallback(
    async (event: MarkerDragEvent) => {
      setShowPopup(true);
      let randomComposition = shuffled.next().value
      
      if(randomComposition === undefined){
        console.log("is undefiend")
        const newShuffle = shuffle([...comps])
        randomComposition = newShuffle.next().value
        setShuffled(newShuffle)
      }
      
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("initial", "false");

      //wrap latitude to -180/180 range
      const lngLat = event.lngLat.wrap();
      newSearchParams.set("lat", lngLat.lat.toString());
      newSearchParams.set("lon", lngLat.lng.toString());
      newSearchParams.set("compositionName", randomComposition[1].name);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    },
    [pathname, searchParams, router, setShowPopup, shuffled, setShuffled]
  );

  return (
    <Marker
      draggable
      latitude={latitude}
      longitude={longitude}
      onDragStart={onMarkerDragStart}
      onDrag={onMarkerDrag}
      onDragEnd={onMarkerDragEnd}
    ></Marker>
  );
}
