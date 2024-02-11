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
} from "react-map-gl";
import { Button } from "@/components/ui/button";

import CompositionsInfo from "@/components/compositions/compositions-info";
import { type CompositionsInfoType } from "@/components/compositions/compositions-info";

import { useRouter } from "next/navigation";
import { MyAudioContext } from "@/hooks/webpd-context";
import LightControl from "./light-control";
import AutoFadeContainer from "./auto-fade-container";
import InfoPanel from "./info-panel";

const initialViewState = {
  latitude: -22.82,
  longitude: -47.07,
  zoom: 1.5,
};

const compositions = Object.entries(CompositionsInfo)
  .map((item) => {
    const newItem = {
      label: item[1].name,
      value: item[0],
    };
    return newItem;
  })
  .filter((item) => {
    if (
      item.label === "zigzag" ||
      item.label === "stormEye" ||
      item.label === "curves" ||
      item.label === "bonfire" ||
      item.label === "digitalOrganism" ||
      item.label === "lightningTrees" ||
      item.label === "mudflatScatter"
    ) {
      return item;
    }
  });

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
    const comps = Object.entries(CompositionsInfo).filter((item) => {
      if (
        item[0] === "zigzag" ||
        item[0] === "stormEye" ||
        item[0] === "curves" ||
        item[0] === "bonfire" ||
        item[0] === "digitalOrganism" ||
        item[0] === "lightningTrees" ||
        item[0] === "mudflatScatter"
      ) {
        return item;
      }
    });

    const randomComposition =
      comps[Math.floor(Math.random() * Object.entries(comps).length)][1];

    setComposition(randomComposition);

    logEvents((_events) => ({
      ..._events,
      onDragEnd: event.lngLat as LngLat,
    }));
    setShowPopup(true);
  }, []);

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
  const [userInteracting, setUserInteracting] = useState(false);
  return (
    <>
      {initial && (
        <div
          className={`grid h-full content-center gap-10 bg-black ${
            initial ? "animate-title-page " : "opacity-0 -z-20"
          }`}
        >
          <div className="max-w-full  md:max-w-[40rem] self-center justify-self-center px-2">
            <h1 className="text-white font-extrabold leading-[0.7em] text-[5rem] md:text-[10rem]">
              Gaia Senses
            </h1>
          </div>
          <div className=" self-center justify-self-center max-w-full  md:max-w-[40rem] px-2 ">
            <h2 className="text-white text-[2rem] md:text-[4rem] font-pop font-semibold leading-tight md:leading-[0.9em] [text-shadow:_0px_1px_1px_rgba(255,255,255,0.6)]">
              Ressonâncias Climáticas
            </h2>
          </div>
        </div>
      )}

      <div
        className={`h-full w-full absolute top-0 left-0 z-10 bg-black ${
          initial ? "mix-blend-darken" : "mix-blend-normal"
        } `}
        id={"total-container"}
      >
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
                    {/* <Button className="text-lg" variant={"outline"}>
                      <Link
                        href={`/full-compositions/${composition.name}/?lat=${marker.latitude}&lon=${marker.longitude}&today=true&play=false&cleanMode=true&initial=false`}
                        scroll={false}
                      >
                        {composition.name}
                      </Link>
                    </Button> */}
                    <Button
                      className="text-2xl focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                      onClick={handleClick}
                    >
                      <p>
                        Clique para ver
                        <span className="capitalize"> {composition.name}</span>
                      </p>

                      {/* <Link
                        href={`/map2?mode=${"composition"}&compositionName=${
                          composition?.name
                        }&lat=${marker.latitude}&lon=${
                          marker.longitude
                        }&play=true&today=true&initial=false`}
                        scroll={false}
                      >
                        {composition.name} : same page
                      </Link> */}
                    </Button>

                    {/* <Combobox
                      options={compositions}
                      onSelect={handleSelect}
                    ></Combobox> */}
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
          <GeolocateControl
            onGeolocate={(e) =>
              setMarker({
                latitude: e.coords.latitude,
                longitude: e.coords.longitude,
              })
            }
          ></GeolocateControl>
          <InfoPanel lat={marker.latitude} lng={marker.longitude}></InfoPanel>
        </Map>
      </div>

      <AutoFadeContainer
        show={mode === "composition" ? true : false}
        compositionName={compositionName}
        timeout={0}
      >
        {children}
      </AutoFadeContainer>
    </>
  );
}
