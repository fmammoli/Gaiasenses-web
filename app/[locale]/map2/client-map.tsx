"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

import {Map,
  FullscreenControl,
  NavigationControl,
  GeolocateControl,
  Marker,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import type { ViewStateChangeEvent, GeolocateResultEvent, MapRef } from "react-map-gl";

import LightControl from "./light-control";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InfoPanel from "./info-panel";
import FloatingHelpBox from "./floating-help-box";
import Rotate from "./rotate";
import CompositionsInfo from "@/components/compositions/compositions-info";

function* shuffle(array: any[]) {
  var i = array.length;
  while (i--) {
      const rand = Math.random() * (i+1)
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


export default function ClientMap({
  children,
  initialLatitude,
  initialLongitude,
  helpTextOptions,
  initialShowPopup,
}: Readonly<{
  initialLatitude: number;
  initialLongitude: number;
  children?: ReactNode;
  helpTextOptions: string[];
  initialShowPopup: boolean
}>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mapRef = useRef<MapRef | null>(null)
  const [marker, setMarker] = useState<{latitude:number, longitude: number}>({latitude: 0, longitude: 0});

  const [showPopup, setShowPopup] = useState(initialShowPopup);


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

  const prevMarker = useRef<{ latitude?: number; longitude?: number; } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [shuffled, setShuffled] = useState(shuffle([...comps]))

  useEffect(()=>{
    console.log("new Marker position")
    if(timerRef.current){
      clearTimeout(timerRef.current)
    }
    prevMarker.current = {...marker}

    timerRef.current = setTimeout(()=>{
      if(searchParams.get("mode") !== "composition" && showPopup === false){
        if(prevMarker.current && marker && 
          prevMarker.current.latitude === marker.latitude && 
          prevMarker.current.longitude === marker.longitude){
            console.log("marker have not moved for 5 seconds")
            setShowPopup(true)
  
            let randomComposition = shuffled.next().value
        
            if(randomComposition === undefined){
              console.log("is undefiend")
              const newShuffle = shuffle([...comps])
              randomComposition = newShuffle.next().value
              setShuffled(newShuffle)
            }
  
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set("initial", "false");
  
            newSearchParams.set("lat", marker.latitude.toString());
            newSearchParams.set("lon", marker.longitude.toString());
            newSearchParams.set("compositionName", randomComposition[1].name);
            router.replace(`${pathname}?${newSearchParams.toString()}`);
  
        }
      }
      
      console.log("moved")
    }, 3000);

  },[marker, pathname, router, searchParams, shuffled])

  return (
    <div className={`h-svh relative isolate bg-black`} id={"total-container"}>
        <Map
          reuseMaps
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN}
          initialViewState={{ ...marker, zoom: 1.5}}
          mapStyle="mapbox://styles/mapbox/standard"
          projection={{ name: "globe" }}
          onZoomEnd={onZoomEnd}
          ref={mapRef}
          onDblClick={(e)=>{
            setMarker({latitude: e.lngLat.lat, longitude: e.lngLat.wrap().lng})
            console.log(mapRef)
            mapRef.current?.easeTo({center:e.lngLat.wrap()})
          }}
          doubleClickZoom={false}
          onMove={(e)=>{
            console.log("moving")
            const center = e.target.getCenter();
            setMarker({latitude: parseInt(center.lat.toString()), longitude: parseInt(center.lng.toString())})
            if(showPopup) {
              setShowPopup(false)
            }
            
          }}
          
        > 
          <Rotate></Rotate>
          <FullscreenControl containerId="total-container"></FullscreenControl>
          <LightControl></LightControl>
          <NavigationControl></NavigationControl>
          <GeolocateControl onGeolocate={onGeolocate}></GeolocateControl>
          
          <Marker longitude={marker.longitude} latitude={marker.latitude}></Marker>

          {showPopup && children}

          <InfoPanel lat={marker.latitude} lng={marker.longitude}></InfoPanel>
        </Map>
        <FloatingHelpBox
          followMouse
          delay={8000}
          helpTextOptions={helpTextOptions}
        ></FloatingHelpBox>
      </div>
  );
}
