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
import MarkerBase from "./marker-base";

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

export default function ClientMap({}) {
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
  console.log("rerender");
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
          <MarkerBase></MarkerBase>
          <NavigationControl></NavigationControl>
          <GeolocateControl onGeolocate={onGeolocate}></GeolocateControl>
          {/* <InfoPanel lat={marker.latitude} lng={marker.longitude}></InfoPanel> */}
        </Map>
      </div>
    </>
  );
}
