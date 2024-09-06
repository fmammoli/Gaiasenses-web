"use client"

import Map, {
    FullscreenControl,
    NavigationControl,
    GeolocateControl,
    Marker,
    MarkerDragEvent,
    Popup,
    GeolocateResultEvent,
    ViewStateChangeEvent,
    MapRef,
  } from "react-map-gl";
  import "mapbox-gl/dist/mapbox-gl.css";
import { ReactNode, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CompositionsInfo from "@/components/compositions/compositions-info";
import JoyconConnectButton from "../switch/joycon-connect-button";
import JoyconControls from "../switch/joycon-controls";
import { AnimatePresence, motion } from "framer-motion";
import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision"
import Webcam from "react-webcam";
import GlobeDetector from "./globe-detector";
import GlobeDetectorWithWorker from "./globe-detector-with-worker";

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
    item[0] === "generativeStrings" ||
    item[0] === "nightRain" ||
    item[0] === "windLines"
  ) {
    return item;
  }
});

function* shuffle(array: any[]) {

  var i = array.length;

  while (i--) {
      const rand = Math.random() * (i+1)
      //console.log(rand)
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

  const mapRef = useRef<MapRef>(null);

  function updatePopupPosition(lat:number, lng:number){
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    newSearchParams.set("lat", lat.toString());
    newSearchParams.set("lng", lng.toString());

    let randomComposition = shuffled.next().value

    if(randomComposition === undefined){
      const newShuffle = shuffle([...comps])
      randomComposition = newShuffle.next().value
      setShuffled(newShuffle)
    }

    newSearchParams.set("composition", randomComposition[0]);
    newSearchParams.set("mode", "map");
    router.replace(`${pathname}?${newSearchParams.toString()}`);
    setShowPopup(true)

    setIdleTimerRedirect(setTimeout(()=>{
      setIsIdleRedirect(true)
    }, 7000))
  }

  function handleDrag(event: MarkerDragEvent) {
    clearTimeout(idleTimer!);
    setIsIdle(false);
    
    clearTimeout(idleTimerRedirect!);
    setIsIdleRedirect(false);

    const wrappedLatLng = event.lngLat.wrap()

    setLatlng([wrappedLatLng.lat, wrappedLatLng.lng])
  }

  function handleDragStart() {
    setShowPopup(false);
  }

  function handleDragEnd(event: MarkerDragEvent){
    const lngLat = event.lngLat.wrap();
    //setLatlng([lngLat.lat,lngLat.lng]);
    //mapRef.current?.setCenter(lngLat);
    //mapRef.current?.easeTo({center:lngLat})
    updatePopupPosition(lngLat.lat,lngLat.lng);
  }
  
  function onGeolocate(e: GeolocateResultEvent) {
    setLatlng([e.coords.latitude, e.coords.longitude]);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("initial", "false");
    newSearchParams.set("lat", e.coords.latitude.toString());
    newSearchParams.set("lon", e.coords.longitude.toString());
    newSearchParams.set("mode", "map");
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  }

  const [isIdle, setIsIdle] = useState(false)
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null)
  
  const [isIdleRedirect, setIsIdleRedirect] = useState(false)
  const [idleTimerRedirect, setIdleTimerRedirect] = useState<NodeJS.Timeout | null>(null)


  const [isIdlePopup, setIsIdlePopup] = useState(false)
  const [idleTimerPopup, setIdleTimerPopup] = useState<NodeJS.Timeout | null>(null)

  function handleIdle(){
    setIdleTimer(setTimeout(()=>{
      setIsIdle(true);
    }, 30000));

    setIdleTimerPopup(setTimeout(()=>{
      setIsIdlePopup(true);
      updatePopupPosition(latlng[0], latlng[1])
    }, 3000));
  }

  function handleMove(e: ViewStateChangeEvent){
    clearTimeout(idleTimer!)
    setIsIdle(false)
    
    clearTimeout(idleTimerRedirect!)
    setIsIdleRedirect(false)
    
    clearTimeout(idleTimerPopup!)
    setIsIdlePopup(false)
    setShowPopup(false)
    
    if(searchParams.get("mode") === "player"){
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("mode","map");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
    
    const center = e.target.getCenter();
    setLatlng([parseFloat(center.lat.toString()), parseFloat(center.lng.toString())])
  }

  function handleMoveEnd(e:ViewStateChangeEvent) {
    const lngLat = e.target.getCenter().wrap()
    setLatlng([lngLat.lat, lngLat.lng]);
  }

  function handlePopupClose() {
    setShowPopup(false)
  }

  useEffect(()=>{
    if(isIdleRedirect){
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      if(newSearchParams.get("mode") === "map"){
        newSearchParams.set("mode", "player");
        router.replace(`${pathname}?${newSearchParams.toString()}`);
        
        clearTimeout(idleTimerRedirect!)
        setIsIdleRedirect(false)
      }
    }
  },[isIdleRedirect, searchParams, router, pathname, idleTimerRedirect])

  

  

  // useEffect(()=>{
    
  //   function predictWebcam() {
  //     if(video && objectDetector){
  //       let startTimeMs = performance.now();
  
  //       if (video.currentTime !== lastVideoTimeRef.current) {
  //         lastVideoTimeRef.current = video.currentTime;
          
  //         const detection = objectDetector.detectForVideo(video, startTimeMs);
          
  //         //console.log(detection.detections.map(item => item.categories[0].categoryName)[1])
  //         const res =  detection.detections.filter(item => item.categories[0].categoryName === "remote" || item.categories[0].categoryName === "cell phone")[0]
  //         if(res && res.boundingBox ){
  //           hypotRef.current = Math.hypot(res.boundingBox?.height || 1, res.boundingBox?.width || 1);
  //           console.log(hypotRef.current)
  //           if(hypotRef.current > 200) {
  //             mapRef.current?.setZoom(7)
  //           } else {
  //             mapRef.current?.setZoom(5)
  //           }
            
  //           //setBoundingBox(res.boundingBox)
  //         }
          
  //       }
      
  //       requestAnimationFrame(() => {
  //         predictWebcam();
  //       });
  //     }
  //   }
  //   predictWebcam()
  // },[video, objectDetector])


  
  return(
    <div style={{height:"100svh", width:"100svw"}}>
      <div className="absolute top-0 z-[1] m-4">
        <div className=" bg-gray-400 bg-opacity-50 text-white p-2 rounded-sm flex justify-evenly">
          <p className="w-40">Lat: {latlng[0].toFixed(8)} </p>
          <p className="w-8">|</p>
          <p className="w-40">Lng: {latlng[1].toFixed(8)}</p>
        </div>
        <JoyconConnectButton></JoyconConnectButton>
      </div>
      <div>
        <AnimatePresence>
          {isIdle && (
            <motion.div
              className="absolute top-1/2 left-1/2 bg-white z-[1] p-2 -translate-x-[50%] rounded-sm shadow-md"
              initial={{opacity:0}}
              animate={{opacity:1}}
              exit={{opacity:0}}
            >
            <div>
              <p className="text-sm italic">Mova o globo para descobrir novas composições</p>
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        
      </div>
      <Map
        ref={mapRef}
        reuseMaps
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN}
        initialViewState={{latitude:latlng[0], longitude:latlng[1], zoom: 1.5 }}
        mapStyle="mapbox://styles/mapbox/standard"
        projection={{ name: "globe" }}
        onMove={handleMove}
        onIdle={handleIdle}
        onMoveEnd={handleMoveEnd}
        maxZoom={15}
      >
        <GlobeDetectorWithWorker></GlobeDetectorWithWorker>
        <JoyconControls></JoyconControls>
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
        
        {isIdlePopup && (
          <Popup latitude={latlng[0]} longitude={latlng[1]}
            anchor="bottom"
            offset={36}
            onClose={handlePopupClose}
            closeOnClick={true}
            closeButton={false}
            maxWidth="40rem"
          >
            {children}
          </Popup>
        )}
      </Map>
    </div>
  )
}
