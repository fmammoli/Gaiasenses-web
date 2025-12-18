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

// @ts-ignore
import "mapbox-gl/dist/mapbox-gl.css";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CompositionsInfo from "@/components/compositions/compositions-info";
import { AnimatePresence, motion } from "framer-motion";

import InfoButton from "./info-button";
import NotificationDialog from "./notifications-dialog";

import BLEControl, { espCo2Response } from "./ble-control";
import AutoMove from "./auto-move";
import { useSensorSmoothing } from "./use-sensor-smoothing";

type location = {
  name: string;
  coords: [number, number];
  composition: string;
};
const locations: location[] = [
  {
    name: "CTI",
    coords: [-47.12870085542251, -22.851741644263786],
    composition: "zigzag",
  },
  {
    name: "Belfast",
    coords: [-5.925948120326226, 54.59624433531145],
    composition: "stormEye",
  },
  {
    name: "São Paulo",
    coords: [-46.62283272732059, -23.554978262429717],
    composition: "burningTrees",
  },
  {
    name: "Tokyo",
    coords: [139.9118266746732, 35.69322960644536],
    composition: "digitalOrganism",
  },
  {
    name: "Paris",
    coords: [2.349091224739889, 48.85701848772013],
    composition: "mudflatScatter",
  },
  {
    name: "Rio de Janeiro",
    coords: [-43.28570708635095, -22.90166071685915],
    composition: "attractor",
  },
  {
    name: "Brasília",
    coords: [-47.3406054804507, -15.795060704219555],
    composition: "riverLines",
  },
];

const comps = Object.entries(CompositionsInfo).filter((item) => {
  if (
    item[0] === "lluvia" ||
    item[0] === "zigzag" ||
    item[0] === "colorFlower" ||
    item[0] === "stormEye" ||
    item[0] === "curves" ||
    item[0] === "cloudBubble" ||
    item[0] === "bonfire" ||
    item[0] === "digitalOrganism" ||
    item[0] === "mudflatScatter" ||
    item[0] === "paintBrush" ||
    item[0] === "generativeStrings" ||
    item[0] === "nightRain" ||
    item[0] === "windLines" ||
    item[0] === "lightnigBolts" ||
    item[0] === "burningTrees" ||
    item[0] === "riverLines" ||
    item[0] === "attractor"
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

/*
 * Play composition if sensor read this value or higher and stop if below
 */
const CO2_LEVEL_THRESHOLD = 2000;

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
  const ORIENTATION_IDLE_DELAY = 400; // ms
  const mapRef = useRef<MapRef>(null);

  const inputModeRef = useRef<string>("mouse");

  function handleDrag(event: MarkerDragEvent) {
    const wrappedLatLng = event.lngLat.wrap();

    setLatlng([wrappedLatLng.lat, wrappedLatLng.lng]);
  }

  function handleDragStart() {
    if (showPopup === true) {
      setShowPopup(false);
    }
  }

  const updatePopupPosition = (lat: number, lng: number) => {
    if (showPopup === false) {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      let randomComposition = shuffled.next().value;

      if (randomComposition === undefined) {
        const newShuffle = shuffle([...comps]);
        randomComposition = newShuffle.next().value;
        setShuffled(newShuffle);
      }

      //Debounced popup logic
      newSearchParams.set("lat", lat.toString());
      newSearchParams.set("lng", lng.toString());
      console.log("router replacing");
      newSearchParams.set("mode", "map");
      newSearchParams.set("composition", randomComposition[0]);
      router.replace(`${pathname}?${newSearchParams.toString()}`);
      //console.log("going to map mode");
      // if (orientationIdleTimer.current)
      //   clearTimeout(orientationIdleTimer.current);
      // orientationIdleTimer.current = setTimeout(() => {
      //   setShowPopup(true);
      // }, ORIENTATION_IDLE_DELAY);
      //setShowPopup(true);
    }
  };

  useEffect(() => {
    setShowPopup(true);
  }, [initialLat, initialLng, setShowPopup]);

  function handleDragEnd(event: MarkerDragEvent) {
    const mode = searchParams.get("mode");
    if (showPopup === false && mode === "map") {
      const lngLat = event.lngLat.wrap();
      updatePopupPosition(lngLat.lat, lngLat.lng);
    }
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

  function handleMove(e: ViewStateChangeEvent) {
    const mode = searchParams.get("mode");
    //if (mode !== "map") return;
    console.log("Handling move event, mode:", mode);
    const center = e.target.getCenter();

    setLatlng([
      parseFloat(center.lat.toString()),
      parseFloat(center.lng.toString()),
    ]);
    if (showPopup === true) {
      setShowPopup(false);
    }
  }

  const handleMoveEnd = (e: ViewStateChangeEvent) => {
    if (inputModeRef.current === "mouse" && showPopup === false) {
      const lngLat = e.target.getCenter().wrap();
      updatePopupPosition(lngLat.lat, lngLat.lng);
    }
  };

  const onMoveEndLong = (lat: number, lon: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    if (newSearchParams.get("mode") === "map") {
      newSearchParams.set("mode", "player");
      newSearchParams.set("lat", lat.toString());
      newSearchParams.set("lng", lon.toString());
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    }
  };

  const onOrientationMoveEnd = (lat: number, lon: number) => {
    //setLatlng([lat, lon]);
    if (inputModeRef.current !== "mouse" && showPopup === false) {
      updatePopupPosition(lat, lon);
    }
  };

  const toggleInputMode = (dcOpen: boolean) => {
    inputModeRef.current = dcOpen ? "controller" : "mouse";
  };

  const [autoActive, setAutoActive] = useState(false);
  const mouseIdleTimer = useRef<NodeJS.Timeout | null>(null);
  const MOUSE_IDLE_DELAY = 120000; // 20 seconds

  // This clear the timers of the automover if the user moves the mouse
  function handleMouseMove() {
    // if (mouseIdleTimer.current) clearTimeout(mouseIdleTimer.current);
    // if (timeout1.current) clearTimeout(timeout1.current);
    // if (timeout2.current) clearTimeout(timeout2.current);
    // if (timeout3.current) clearTimeout(timeout3.current);
    //setAutoActive(false);
    // mouseIdleTimer.current = setTimeout(() => {
    //   setAutoActive(true);
    // }, MOUSE_IDLE_DELAY);
  }

  // useEffect(() => {
  //   return () => {
  //     if (mouseIdleTimer.current) clearTimeout(mouseIdleTimer.current);
  //   };
  // }, []);

  const onAutoActivateToggle = (state: boolean) => {
    console.log(`Setting automode: ${state}`);
    setAutoActive(state);
    if (state === false) {
      if (timeout1.current) clearTimeout(timeout1.current);
      if (timeout2.current) clearTimeout(timeout2.current);
      if (timeout3.current) clearTimeout(timeout3.current);
    }
  };

  const timeout1 = useRef<NodeJS.Timeout | null>(null);
  const TIMEOUT_1_PAUSE = 5000; // 10 seconds

  const timeout2 = useRef<NodeJS.Timeout | null>(null);
  const TIMEOUT_2_PAUSE = 20000; // 10 seconds

  const timeout3 = useRef<NodeJS.Timeout | null>(null);
  const TIMEOUT_3_PAUSE = 5000; // 10 seconds

  const [autoLocationIndex, setAutoLocationIndex] = useState(0);

  function onMoveEndAuto(e: ViewStateChangeEvent) {
    const [lng, lat] = locations[autoLocationIndex].coords;
    //setLatlng([lat, lng]);
    console.log("Auto move end, ", autoActive);
    timeout1.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("lat", lat.toString());
      params.set("lng", lng.toString());
      params.set("mode", "player");
      params.set("composition", locations[autoLocationIndex].composition);
      router.replace(`${pathname}?${params.toString()}`);
      timeout2.current = setTimeout(() => {
        // params.set("lat", lat.toString());
        // params.set("lng", lng.toString());
        params.set("mode", "map");
        //params.set("composition", locations[autoLocationIndex].composition);
        router.replace(`${pathname}?${params.toString()}`);

        timeout3.current = setTimeout(() => {
          setAutoLocationIndex((prev) => {
            const next = prev + 1;
            if (next > locations.length - 1) {
              return 0;
            } else {
              return next;
            }
          });
        }, TIMEOUT_3_PAUSE);
      }, TIMEOUT_2_PAUSE);
    }, TIMEOUT_1_PAUSE);
  }

  useEffect(() => {
    if (autoActive) {
      mapRef.current?.flyTo({
        center: locations[autoLocationIndex].coords,
        speed: 0.7,
        zoom: 4,
        easing: (t) => t ** 2,
      });
    }
  }, [autoActive, autoLocationIndex]);

  const isCompositionPlayingRef = useRef(false);

  const handleMotionStop = () => {
    //console.log("Handling motion stop in map component");
    //console.log("Current input mode:", inputModeRef.current);
    const mode = searchParams.get("mode") || "map";
    console.log(mode);
    if (
      inputModeRef.current !== "mouse" &&
      mode === "map" &&
      isCompositionPlayingRef.current === false
    ) {
      const center = mapRef.current?.getCenter().wrap();
      if (center) {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        let randomComposition = shuffled.next().value;

        if (randomComposition === undefined) {
          const newShuffle = shuffle([...comps]);
          randomComposition = newShuffle.next().value;
          setShuffled(newShuffle);
        }
        //console.log("Motion stopped detected callback in map");

        newSearchParams.set("lat", center.lat.toString());
        newSearchParams.set("lng", center.lng.toString());
        newSearchParams.set("mode", "map");
        console.log("router replacing from handle motion stop");
        newSearchParams.set("composition", randomComposition[0]);
        router.replace(`${pathname}?${newSearchParams.toString()}`);
      }
    }
  };

  const { handleOnSensor } = useSensorSmoothing(mapRef, handleMotionStop);

  const handleOnCO2Sensor = (data: espCo2Response) => {
    if (isCompositionPlayingRef.current === false) {
      if (data.co2.ppm > CO2_LEVEL_THRESHOLD) {
        const newSearchParams = new URLSearchParams(searchParams.toString());

        console.log("High CO2 level detected:", data.co2.ppm);
        //Debounced popup logic
        newSearchParams.set(
          "lat",
          mapRef.current?.getCenter().lat.toString() || initialLat.toString()
        );
        newSearchParams.set(
          "lng",
          mapRef.current?.getCenter().lng.toString() || initialLat.toString()
        );

        let randomComposition = shuffled.next().value;

        if (randomComposition === undefined) {
          const newShuffle = shuffle([...comps]);
          randomComposition = newShuffle.next().value;
          setShuffled(newShuffle);
        }
        newSearchParams.set("composition", randomComposition[0]);

        newSearchParams.set("mode", "player");
        newSearchParams.set("play", true.toString());
        router.replace(`${pathname}?${newSearchParams.toString()}`);
        isCompositionPlayingRef.current = true;
      }
    } else {
      if (data.co2.ppm <= CO2_LEVEL_THRESHOLD) {
        console.log("CO2 levels back to normal:", data.co2.ppm);

        const newSearchParams = new URLSearchParams(searchParams.toString());

        //Debounced popup logic
        newSearchParams.set("lat", searchParams.get("lat") || "0");
        newSearchParams.set("lng", searchParams.get("lng") || "0");

        newSearchParams.set(
          "composition",
          searchParams.get("composition") || "windLines"
        );
        newSearchParams.set("mode", "map");

        router.replace(`${pathname}?${newSearchParams.toString()}`);
        isCompositionPlayingRef.current = false;
      }
    }
  };

  // ...existing code...
  const toggleMode = (mode: string) => {
    console.log("Toggling input mode to:", mode);
    inputModeRef.current = mode;
  };

  return (
    <div
      style={{ height: "100svh", width: "100svw" }}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-0 z-[1] ">
        <div className="m-4 bg-gray-400 bg-opacity-50 text-white p-2 rounded-sm flex justify-evenly sm:max-w-[240px] md:max-w-[400px]">
          <p className="w-24 text-sm">Lat: {latlng[0].toFixed(5)} </p>
          <p className="w-4 text-xs">|</p>
          <p className="w-28 text-sm">Lng: {latlng[1].toFixed(5)}</p>
        </div>
      </div>
      <div>
        <NotificationDialog></NotificationDialog>
      </div>
      <div>
        <InfoButton></InfoButton>
      </div>
      <div>
        <div className=""></div>
      </div>
      <div>
        <AnimatePresence>
          {false && (
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
          zoom: 2,
        }}
        mapStyle="mapbox://styles/mapbox/standard"
        projection={{ name: "globe" }}
        onMove={handleMove}
        onMoveEnd={(e: ViewStateChangeEvent) => {
          if (autoActive) {
            handleMoveEnd(e);
            onMoveEndAuto(e);
          } else {
            handleMoveEnd(e);
          }
        }}
      >
        <FullscreenControl containerId="total-container"></FullscreenControl>
        <NavigationControl></NavigationControl>
        <AutoMove
          isActive={autoActive}
          onActivate={onAutoActivateToggle}
          onDeactivate={onAutoActivateToggle}
        ></AutoMove>
        <BLEControl
          onSensor={handleOnSensor}
          onConnect={toggleMode}
          onDisconnect={toggleMode}
          onCo2Sensor={handleOnCO2Sensor}
        ></BLEControl>
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
