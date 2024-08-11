"use client"

import Map, {
    FullscreenControl,
    NavigationControl,
    GeolocateControl,
    Marker,
    MarkerDragEvent,
    Popup,
    GeolocateResultEvent,
  } from "react-map-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
import { ReactNode, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CompositionsInfo from "@/components/compositions/compositions-info";


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

function* shuffle(array: any[]) {

  var i = array.length;

  while (i--) {
      const rand = Math.random() * (i+1)
      console.log(rand)
      yield array.splice(Math.floor(rand), 1)[0];
  }
}

type GaiasensesMapProps = {
  children: ReactNode,
  initialLat: number,
  initialLng: number
}

export default function GaiasensesMap({children, initialLat, initialLng}:GaiasensesMapProps){

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [shuffled, setShuffled] = useState(shuffle([...comps]))

  const [latlng, setLatlng ] = useState<[number, number]>([initialLat,initialLng])
  const [showPopup, setShowPopup] = useState<boolean>(true);

  function handleDrag(event: MarkerDragEvent) {
    const wrappedLatLng = event.lngLat.wrap()
    setLatlng([wrappedLatLng.lat, wrappedLatLng.lng])
  }

  function handleDragStart() {
    setShowPopup(false)
  }
  function handleDragEnd(event: MarkerDragEvent){
    const lngLat = event.lngLat.wrap();
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("lat", lngLat.lat.toString());
    newSearchParams.set("lng", lngLat.lng.toString());


    let randomComposition = shuffled.next().value

    if(randomComposition === undefined){
      console.log("is undefiend")
      const newShuffle = shuffle([...comps])
      randomComposition = newShuffle.next().value
      setShuffled(newShuffle)
    }

    newSearchParams.set("composition", randomComposition[0]);
    router.replace(`${pathname}?${newSearchParams.toString()}`);
    setShowPopup(true)
  }
  

  function onGeolocate(e: GeolocateResultEvent) {
    setLatlng([e.coords.latitude, e.coords.longitude]);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("initial", "false");
    newSearchParams.set("lat", e.coords.latitude.toString());
    newSearchParams.set("lon", e.coords.longitude.toString());
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  }

  return(
    <div style={{height:"100svh", width:"100svw"}}>
      <div className="absolute top-0 z-[1] m-4 bg-gray-400 bg-opacity-50 text-white p-2 rounded-sm flex justify-evenly">
        <p className="w-40">Lat: {latlng[0].toFixed(8)} </p>
        <p className="w-8">|</p>
        <p className="w-40">Lng: {latlng[1].toFixed(8)}</p>
      </div>
      <Map
        reuseMaps
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN}
        initialViewState={{latitude:latlng[0], longitude:latlng[1], zoom: 1.5 }}
        mapStyle="mapbox://styles/mapbox/standard"
        projection={{ name: "globe" }}
      >
        <FullscreenControl containerId="total-container"></FullscreenControl>
        <NavigationControl></NavigationControl>
        <GeolocateControl onGeolocate={onGeolocate}></GeolocateControl>
        <Marker 
          latitude={latlng[0]}
          longitude={latlng[1]}
          draggable
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={(e)=>{
            //Stop propagaiton so popup does not close when marker is clicked
            e.originalEvent.preventDefault()
            e.originalEvent.stopPropagation()
            setShowPopup(true);
          }}
        ></Marker>

        {showPopup && (
        <Popup latitude={latlng[0]} longitude={latlng[1]}
          anchor="bottom"
          offset={36}
          onClose={() => {
            console.log("on close")
            setShowPopup(false)
          }}
          closeOnClick={true}
          closeButton={false}
          maxWidth="40rem"
        >
          {children}
        </Popup>)}
      </Map>
    </div>
  )
}