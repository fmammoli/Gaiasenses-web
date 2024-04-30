"use client";
import { useState, type ReactNode } from "react";

import Map, {
  FullscreenControl,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import type { ViewStateChangeEvent, GeolocateResultEvent } from "react-map-gl";

import MarkerBase from "./marker-base";
import LightControl from "./light-control";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InfoPanel from "./info-panel";
import FloatingHelpBox from "./floating-help-box";
import PopupBase from "./popup-base";

export default function ClientMap({
  children,
  initialLatitude,
  initialLongitude,
}: {
  initialLatitude: number;
  initialLongitude: number;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [marker, setMarker] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
  });

  const [showPopup, setShowPopup] = useState(false);

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

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("initial", "false");
    newSearchParams.set("lat", e.coords.latitude.toString());
    newSearchParams.set("lon", e.coords.longitude.toString());
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  }

  return (
    <>
      <div className={`h-svh relative isolate bg-black`} id={"total-container"}>
        <Map
          reuseMaps
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN}
          initialViewState={{ ...marker, zoom: 1.5 }}
          mapStyle="mapbox://styles/mapbox/standard"
          projection={{ name: "globe" }}
          onClick={() => console.log("click")}
          onZoomEnd={onZoomEnd}
        >
          <FullscreenControl containerId="total-container"></FullscreenControl>
          <LightControl></LightControl>
          <NavigationControl></NavigationControl>
          <GeolocateControl onGeolocate={onGeolocate}></GeolocateControl>
          <MarkerBase
            longitude={marker.longitude}
            latitude={marker.latitude}
            setMarker={setMarker}
            setShowPopup={setShowPopup}
          ></MarkerBase>

          {showPopup && children}

          <InfoPanel lat={marker.latitude} lng={marker.longitude}></InfoPanel>
        </Map>
        <FloatingHelpBox followMouse delay={8000}></FloatingHelpBox>

        {/*       
        <FloatingHelpBox delay={1}>
          <div className="absolute top-1/2 p-50 left-[4rem] bg-white p-2 rounded">
            <p className="text-md text-gray-500">
              Clique e arraste para girar o globo
            </p>
          </div>
        </FloatingHelpBox>
        <FloatingHelpBox delay={1}>
          <div className="absolute top-1/2 p-50 right-[4rem] bg-white p-2 rounded">
            <p className="text-md text-gray-500">
              Clique e arraste o marcador para movê-lo para outro lugar
            </p>
          </div>
        </FloatingHelpBox> */}
      </div>
    </>
  );
}
