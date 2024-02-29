"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
} from "react";
import { Marker, type MarkerDragEvent } from "react-map-gl";
import CompositionsInfo from "@/components/compositions/compositions-info";

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
      setMarker({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    },
    [setMarker]
  );

  const onMarkerDragEnd = useCallback(
    async (event: MarkerDragEvent) => {
      setShowPopup(true);
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

      const randomComposition =
        comps[Math.floor(Math.random() * Object.entries(comps).length)][1];

      // logEvents((_events) => ({
      //   ..._events,
      //   onDragEnd: event.lngLat as LngLat,
      // }));

      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("initial", "false");
      newSearchParams.set("lat", event.lngLat.lat.toString());
      newSearchParams.set("lon", event.lngLat.lng.toString());
      newSearchParams.set("compositionName", randomComposition.name);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    },
    [pathname, searchParams, router, setShowPopup]
  );

  return (
    <>
      <Marker
        draggable
        latitude={latitude}
        longitude={longitude}
        onDragStart={onMarkerDragStart}
        onDrag={onMarkerDrag}
        onDragEnd={onMarkerDragEnd}
      ></Marker>
    </>
  );
}
