"use client";
import { useCallback, useState, type ReactNode, useContext } from "react";

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
  GeolocateResultEvent,
} from "react-map-gl";
import { Button } from "@/components/ui/button";

import CompositionsInfo from "@/components/compositions/compositions-info";
import { type CompositionsInfoType } from "@/components/compositions/compositions-info";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MyAudioContext } from "@/hooks/webpd-context";
import LightControl from "./light-control";
import InfoPanel from "./info-panel";

const initialViewState = {
  latitude: -22.82,
  longitude: -47.07,
  zoom: 1.5,
};

// The following values can be changed to control rotation speed:

// At low zooms, complete a revolution every two minutes.
const secondsPerRevolution = 240;
// Above zoom level 5, do not rotate.
const maxSpinZoom = 5;
// Rotate at intermediate speeds between zoom levels 3 and 5.
const slowSpinZoom = 3;

const spinEnabled = true;

export default function ClientMap({
  children,
  mode = "map",
  initial = true,
  compositionName,
  timed,
}: {
  children?: ReactNode;
  mode: "map" | "composition";
  initial: boolean;
  compositionName: string | undefined;
  timed: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  if (mode === "composition" && composition) {
    setTimeout(() => {
      setComposition(null);
    }, 10000);
  }
  const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    setComposition(null);
    // logEvents((_events) => ({
    //   ..._events,
    //   onDragStart: event.lngLat as LngLat,
    // }));
    setShowPopup(false);
  }, []);

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    // logEvents((_events) => ({ ..._events, onDrag: event.lngLat as LngLat }));

    setMarker({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
  }, []);

  const onMarkerDragEnd = useCallback(
    async (event: MarkerDragEvent) => {
      const comps = Object.entries(CompositionsInfo).filter((item) => {
        if (
          item[0] === "zigzag" ||
          item[0] === "stormEye" ||
          item[0] === "curves" ||
          item[0] === "bonfire" ||
          item[0] === "digitalOrganism" ||
          item[0] === "mudflatScatter" ||
          item[0] === "cloudBubble" ||
          item[0] === "paintBrush"
        ) {
          return item;
        }
      });

      const randomComposition =
        comps[Math.floor(Math.random() * Object.entries(comps).length)][1];

      setComposition(randomComposition);

      // logEvents((_events) => ({
      //   ..._events,
      //   onDragEnd: event.lngLat as LngLat,
      // }));
      setShowPopup(true);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("lat", event.lngLat.lat.toString());
      newSearchParams.set("lat", event.lngLat.lng.toString());
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    },
    [pathname, searchParams, router]
  );

  const handleClick = () => {
    setShowPopup(false);
    if (composition) {
      router.replace(
        `/map2?mode=${"composition"}&timed=${timed}&compositionName=${
          composition?.name
        }&lat=${marker.latitude}&lon=${
          marker.longitude
        }&play=true&today=true&initial=false`,
        { scroll: false }
      );
    }
  };

  //make a slow pitch, it increases as it zooms from a specific zoom value
  const onZoomEnd = (e: ViewStateChangeEvent) => {
    if (e.viewState.zoom >= 16) {
      if (e.viewState.pitch < 60) {
        e.target.easeTo({ pitch: 60, duration: 1000 });
      }
    }
    if (e.viewState.zoom < 16) {
      if (e.viewState.pitch !== 0) {
        e.target.easeTo({ pitch: 0, duration: 1000 });
      }
    }
  };

  function onGeolocate(e: GeolocateResultEvent) {
    setMarker({
      latitude: e.coords.latitude,
      longitude: e.coords.longitude,
    });
  }

  return (
    <>
      <div className={`h-svh relative isolate bg-black`} id={"total-container"}>
        <Map
          reuseMaps
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN}
          initialViewState={initialViewState}
          mapStyle="mapbox://styles/mapbox/standard"
          projection={{ name: "globe" }}
          onZoomEnd={onZoomEnd}
        >
          <LightControl></LightControl>

          <FullscreenControl containerId="total-container"></FullscreenControl>
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
                offset={38}
                latitude={marker.latitude}
                longitude={marker.longitude}
                anchor="bottom"
                onClose={() => {
                  setShowPopup(false);
                }}
                closeButton={false}
                maxWidth={"40rem"}
              >
                {composition ? (
                  <>
                    <Button
                      className="text-2xl focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                      onClick={handleClick}
                    >
                      <p>
                        Clique para ver
                        <span className="capitalize"> {composition.name}</span>
                      </p>
                    </Button>
                  </>
                ) : (
                  <p className="text-xl">
                    Arraste o Pin para descobrir novas composições.
                  </p>
                )}
              </Popup>
            )}
          </Marker>
          <NavigationControl></NavigationControl>
          <GeolocateControl onGeolocate={onGeolocate}></GeolocateControl>
          <InfoPanel lat={marker.latitude} lng={marker.longitude}></InfoPanel>
        </Map>
      </div>
    </>
  );
}
