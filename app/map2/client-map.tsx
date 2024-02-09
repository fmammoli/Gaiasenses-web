"use client";
import {
  useCallback,
  useState,
  type ReactNode,
  useContext,
  useRef,
} from "react";

import Map, {
  FullscreenControl,
  Marker,
  NavigationControl,
  Popup,
  GeolocateControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import type {
  MarkerDragEvent,
  LngLat,
  ViewStateChangeEvent,
} from "react-map-gl";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CompositionsInfo from "@/components/compositions/compositions-info";
import { type CompositionsInfoType } from "@/components/compositions/compositions-info";
import { Combobox } from "@/components/ui/combo-box";
import { useRouter } from "next/navigation";
import { MyAudioContext } from "@/hooks/webpd-context";
import LightControl from "./light-control";

const initialViewState = {
  latitude: -22.82,
  longitude: -47.07,
  zoom: 0,
};

const compositions = Object.entries(CompositionsInfo).map((item) => {
  const newItem = {
    label: item[1].name,
    value: item[0],
  };
  return newItem;
});

export default function ClientMap({
  children,
  mode = "map",
}: {
  children?: ReactNode;
  mode: "map" | "composition";
}) {
  const router = useRouter();
  const { suspend, status } = useContext(MyAudioContext);

  if (status === "playing") {
    suspend && suspend();
  }

  const [marker, setMarker] = useState({
    latitude: initialViewState.latitude,
    longitude: initialViewState.longitude,
  });

  const [showPopup, setShowPopup] = useState(false);

  const [events, logEvents] = useState<Record<string, LngLat>>({});

  const [composition, setComposition] = useState<
    CompositionsInfoType[keyof CompositionsInfoType] | null
  >();

  const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    setComposition(null);
    logEvents((_events) => ({
      ..._events,
      onDragStart: event.lngLat as LngLat,
    }));
    setShowPopup(false);
  }, []);

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    logEvents((_events) => ({ ..._events, onDrag: event.lngLat as LngLat }));

    setMarker({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
  }, []);

  const onMarkerDragEnd = useCallback(async (event: MarkerDragEvent) => {
    // const composition = await getDefaultComposition(
    //   event.lngLat.lat.toString(),
    //   event.lngLat.lng.toString()
    // );

    const randomComposition =
      Object.entries(CompositionsInfo)[
        Math.floor(Math.random() * Object.entries(CompositionsInfo).length)
      ][1];

    setComposition(randomComposition);

    logEvents((_events) => ({
      ..._events,
      onDragEnd: event.lngLat as LngLat,
    }));
    setShowPopup(true);
  }, []);

  const handleSelect = (currentValue: string) => {
    setComposition(
      CompositionsInfo[currentValue as keyof CompositionsInfoType]
    );

    router.push(
      `/full-compositions/${currentValue}/?lat=${marker.latitude}&lon=${marker.longitude}&today=true&play=false&cleanMode=true`
    );
  };

  const prevZoomRef = useRef(initialViewState.zoom);
  //make a slow pitch, it increases as it zooms from a specific zoom value
  const onZoomEnd = (e: ViewStateChangeEvent) => {
    if (e.viewState.zoom >= 16) {
      if (e.viewState.pitch < 60) {
        e.target.easeTo({ pitch: 60, duration: 1000 });
      }
    }
    if (e.viewState.zoom < 16) {
      if (e.viewState.pitch >= 60) {
        e.target.easeTo({ pitch: 0, duration: 1000 });
      }
    }
  };

  return (
    <>
      <div className="h-full">
        <Map
          reuseMaps
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/standard"
          projection={{ name: "globe" }}
          onZoomEnd={onZoomEnd}
        >
          <LightControl></LightControl>
          <FullscreenControl></FullscreenControl>
          <Marker
            draggable
            latitude={marker.latitude}
            longitude={marker.longitude}
            onDragStart={onMarkerDragStart}
            onDrag={onMarkerDrag}
            onDragEnd={onMarkerDragEnd}
          >
            {showPopup && (
              <Popup
                offset={30}
                latitude={marker.latitude}
                longitude={marker.longitude}
                anchor="bottom"
                onClose={() => {
                  console.log("closing");
                  setShowPopup(false);
                }}
                closeButton={false}
              >
                {composition ? (
                  <>
                    <Button className="text-lg" variant={"outline"} asChild>
                      {/* <Link
                        href={`/map2?mode=${"composition"}&compositionName=${
                          composition?.name
                        }&lat=${marker.latitude}&lon=${
                          marker.longitude
                        }&play=false`}
                        scroll={false}
                      >
                        {composition.name}
                      </Link> */}
                      <Link
                        href={`/full-compositions/${composition.name}/?lat=${marker.latitude}&lon=${marker.longitude}&today=true&play=false&cleanMode=true`}
                        scroll={false}
                      >
                        {composition.name}
                      </Link>
                    </Button>
                    <Combobox
                      options={compositions}
                      onSelect={handleSelect}
                    ></Combobox>
                  </>
                ) : (
                  <p className="text-lg text-secondary">
                    Analisando dados atmosféricos....
                  </p>
                )}
              </Popup>
            )}
          </Marker>
          <NavigationControl></NavigationControl>
          <GeolocateControl
            onGeolocate={(e) =>
              setMarker({
                latitude: e.coords.latitude,
                longitude: e.coords.longitude,
              })
            }
          ></GeolocateControl>
        </Map>
        {/* <div
          className={`absolute h-full top-0 left-0 w-full bg-black isolate transition-opacity ${
            mode === "composition" ? "opacity-100 z-[1]" : "opacity-0 -z-10"
          } `}
        >
          <div className="relative">{children}</div>
          <Button className="text-lg" variant={"outline"} asChild>
            <Link
              href={`/map2?mode=${"map"}&compositionName=${
                composition?.name
              }&lat=${marker.latitude}&lon=${marker.longitude}&play=false`}
              scroll={false}
            >
              Back to map
            </Link>
          </Button>
        </div> */}
      </div>
    </>
  );
}
