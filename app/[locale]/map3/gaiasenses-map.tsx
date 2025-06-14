"use client";

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
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CompositionsInfo from "@/components/compositions/compositions-info";
import { AnimatePresence, motion } from "framer-motion";

import InfoButton from "./info-button";
import ReceiverDialog from "./receiver-dialog";

import OrientationControl from "./orientation-control";

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
    const rand = Math.random() * (i + 1);
    yield array.splice(Math.floor(rand), 1)[0];
  }
}

type GaiasensesMapProps = {
  children: ReactNode;
  initialLat: number;
  initialLng: number;
  InfoButtonText: string;
};

export default function GaiasensesMap({
  children,
  initialLat,
  initialLng,
  InfoButtonText,
}: GaiasensesMapProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [shuffled, setShuffled] = useState(shuffle([...comps]));

  const [latlng, setLatlng] = useState<[number, number]>([
    initialLat,
    initialLng,
  ]);
  const [showPopup, setShowPopup] = useState<boolean>(true);
  const orientationIdleTimer = useRef<NodeJS.Timeout | null>(null);
  const ORIENTATION_IDLE_DELAY = 300; // ms
  const mapRef = useRef<MapRef>(null);

  const [inputMode, setInputMode] = useState<string>("mouse");

  function handleDrag(event: MarkerDragEvent) {
    clearTimeout(idleTimer!);
    setIsIdle(false);

    clearTimeout(idleTimerRedirect!);
    setIsIdleRedirect(false);

    const wrappedLatLng = event.lngLat.wrap();

    setLatlng([wrappedLatLng.lat, wrappedLatLng.lng]);
  }

  function handleDragStart() {
    setShowPopup(false);
  }

  const updatePopupPosition = useCallback(
    (lat: number, lng: number) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      newSearchParams.set("lat", lat.toString());
      newSearchParams.set("lng", lng.toString());

      let randomComposition = shuffled.next().value;

      if (randomComposition === undefined) {
        const newShuffle = shuffle([...comps]);
        randomComposition = newShuffle.next().value;
        setShuffled(newShuffle);
      }

      //Debounced popup logic
      //setShowPopup(true);

      if (orientationIdleTimer.current)
        clearTimeout(orientationIdleTimer.current);
      orientationIdleTimer.current = setTimeout(() => {
        setShowPopup(true);
      }, ORIENTATION_IDLE_DELAY);

      newSearchParams.set("composition", randomComposition[0]);
      newSearchParams.set("mode", "map");
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    },
    [searchParams, shuffled, router, pathname]
  );

  function handleDragEnd(event: MarkerDragEvent) {
    const lngLat = event.lngLat.wrap();
    //setLatlng([lngLat.lat,lngLat.lng]);
    //mapRef.current?.setCenter(lngLat);
    //mapRef.current?.easeTo({center:lngLat})
    updatePopupPosition(lngLat.lat, lngLat.lng);
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

  const [isIdle, setIsIdle] = useState(false);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);

  const [isIdleRedirect, setIsIdleRedirect] = useState(false);
  const [idleTimerRedirect, setIdleTimerRedirect] =
    useState<NodeJS.Timeout | null>(null);

  function handleIdle() {
    //console.log("idle")
    setIdleTimer(
      setTimeout(() => {
        setIsIdle(true);
      }, 30000)
    );
  }

  function handleMove(e: ViewStateChangeEvent) {
    clearTimeout(idleTimer!);
    setIsIdle(false);

    clearTimeout(idleTimerRedirect!);
    setIsIdleRedirect(false);

    const center = e.target.getCenter();
    setLatlng([
      parseFloat(center.lat.toString()),
      parseFloat(center.lng.toString()),
    ]);
    setShowPopup(false);
  }

  const handleMoveEnd = useCallback(
    (e: ViewStateChangeEvent) => {
      if (inputMode === "mouse") {
        console.log("move end");
        const lngLat = e.target.getCenter().wrap();
        updatePopupPosition(lngLat.lat, lngLat.lng);
      }
    },
    [inputMode, updatePopupPosition]
  );

  useEffect(() => {
    if (isIdle) {
      console.log("isIdle for 5s");
    }
  }, [isIdle]);

  useEffect(() => {
    if (isIdleRedirect) {
      console.log("isIdle for 10s");
      const newSearchParams = new URLSearchParams(searchParams.toString());

      if (newSearchParams.get("mode") === "map") {
        newSearchParams.set("mode", "player");
        router.replace(`${pathname}?${newSearchParams.toString()}`);

        clearTimeout(idleTimerRedirect!);
        setIsIdleRedirect(false);
      }
    }
  }, [isIdleRedirect, searchParams, router, pathname, idleTimerRedirect]);

  const toggleInputMode = (dcOpen: boolean) => {
    setInputMode((prevMode) => {
      if (dcOpen) {
        if (prevMode === "mouse") {
          return "controller";
        }
      }
      return prevMode;
    });
  };

  return (
    <div style={{ height: "100svh", width: "100svw" }}>
      <div className="absolute top-0 z-[1] ">
        <div className="m-4 bg-gray-400 bg-opacity-50 text-white p-2 rounded-sm flex justify-evenly sm:max-w-[240px] md:max-w-[400px]">
          <p className="w-24 text-sm">Lat: {latlng[0].toFixed(5)} </p>
          <p className="w-4 text-xs">|</p>
          <p className="w-28 text-sm">Lng: {latlng[1].toFixed(5)}</p>
        </div>
      </div>
      <div>
        <ReceiverDialog></ReceiverDialog>
      </div>
      <div>
        <InfoButton></InfoButton>
      </div>
      <div>
        <AnimatePresence>
          {isIdle && (
            <motion.div
              className="absolute top-1/2 left-1/2 bg-white z-[1] p-2 -translate-x-[50%] rounded-sm shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>
                <p className="text-sm italic">
                  Mova o globo para descobrir novas composições
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Map
        ref={mapRef}
        reuseMaps
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_ACCESS_TOKEN}
        initialViewState={{
          latitude: latlng[0],
          longitude: latlng[1],
          zoom: 1.5,
        }}
        mapStyle="mapbox://styles/mapbox/standard"
        projection={{ name: "globe" }}
        onMove={handleMove}
        onIdle={handleIdle}
        onMoveEnd={handleMoveEnd}
      >
        <FullscreenControl containerId="total-container"></FullscreenControl>
        <NavigationControl></NavigationControl>
        <OrientationControl
          onMoveEnd={updatePopupPosition}
          onConnected={toggleInputMode}
        ></OrientationControl>
        <GeolocateControl onGeolocate={onGeolocate}></GeolocateControl>
        <Marker
          latitude={latlng[0]}
          longitude={latlng[1]}
          draggable
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={(e) => {
            //Stop propagaiton so popup does not close when marker is clicked
            e.originalEvent.preventDefault();
            e.originalEvent.stopPropagation();
            setShowPopup(true);
          }}
        ></Marker>

        {showPopup && (
          <Popup
            latitude={latlng[0]}
            longitude={latlng[1]}
            anchor="bottom"
            offset={36}
            onClose={() => {
              console.log("on close");
              setShowPopup(false);
            }}
            closeOnClick={true}
            closeButton={false}
            maxWidth="40rem"
          >
            {children}
          </Popup>
        )}
      </Map>
    </div>
  );
}
