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
import ReceiverDialog from "./receiver-dialog";
import NotificationDialog from "./notifications-dialog";

import OrientationControl from "./orientation-control";
import BLEControl, { espResponse } from "./ble-control";
import AutoMove from "./auto-move";

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

  const [inputMode, setInputMode] = useState<string>("mouse");

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
    if (showPopup === false) {
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
    if (inputMode === "mouse" && showPopup === false) {
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
    if (inputMode !== "mouse" && showPopup === false) {
      updatePopupPosition(lat, lon);
    }
  };

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

  // ...existing code...
  // --- improved sensor smoothing + denoise (median + EMA + clamp / optional quaternion slerp) ---
  const sensorBufferRef = useRef<
    Array<{ yaw: number; pitch: number; roll: number }>
  >([]);
  const sensorSmoothedRef = useRef<{
    alpha: number;
    beta: number;
    gamma: number;
  }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const BUFFER_SIZE = 5; // median window size (odd)
  const EMA_ALPHA = 0.08; // smaller => stronger smoothing
  const MAP_UPDATE_HZ = 20;
  const MAP_UPDATE_MS = 1000 / MAP_UPDATE_HZ;
  const MAX_DELTA_PER_UPDATE = 2.5; // degrees max jump per map update (clamp)

  function median(values: number[]) {
    const arr = [...values].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  }

  // optional: convert quaternion -> euler if your sensor sends quaternion
  function quatToEuler(q: { w: number; x: number; y: number; z: number }) {
    const { w, x, y, z } = q;
    const ysqr = y * y;

    // roll (x-axis rotation)
    const t0 = 2 * (w * x + y * z);
    const t1 = 1 - 2 * (x * x + ysqr);
    const roll = Math.atan2(t0, t1) * (180 / Math.PI);

    // pitch (y-axis rotation)
    let t2 = 2 * (w * y - z * x);
    t2 = Math.max(-1, Math.min(1, t2));
    const pitch = Math.asin(t2) * (180 / Math.PI);

    // yaw (z-axis rotation)
    const t3 = 2 * (w * z + x * y);
    const t4 = 1 - 2 * (ysqr + z * z);
    const yaw = Math.atan2(t3, t4) * (180 / Math.PI);

    return { yaw, pitch, roll };
  }

  const handleOnSensor = useCallback((data: any) => {
    if (!data) return;

    let yaw = 0,
      pitch = 0,
      roll = 0;
    data.q = {
      w: data.quat.quat_w,
      x: data.quat.quat_x,
      y: data.quat.quat_y,
      z: data.quat.quat_z,
    };
    if (data.q && typeof data.q === "object") {
      const q = data.q as {
        w: number;
        x: number;
        y: number;
        z: number;
      };
      const e = quatToEuler(q);
      yaw = e.yaw;
      pitch = e.pitch;
      roll = e.roll;
    } else {
      yaw = Number(data.euler?.yaw ?? 0);
      pitch = Number(data.euler?.pitch ?? 0);
      roll = Number(data.euler?.roll ?? 0);
    }

    // normalize yaw into [-180,180]
    yaw = ((((yaw + 180) % 360) + 360) % 360) - 180;

    const buf = sensorBufferRef.current;
    buf.push({ yaw, pitch, roll });
    if (buf.length > BUFFER_SIZE) buf.shift();
  }, []);

  useEffect(() => {
    let raf = 0;
    let lastMapUpdate = 0;

    function step() {
      const now = performance.now();
      const buf = sensorBufferRef.current;
      if (buf.length > 0) {
        // median filter on buffer
        const yaws = buf.map((s) => s.yaw);
        const pitches = buf.map((s) => s.pitch);
        const rolls = buf.map((s) => s.roll);

        const medYaw = median(yaws);
        const medPitch = median(pitches);
        const medRoll = median(rolls);

        // EMA smoothing
        const s = sensorSmoothedRef.current;
        s.alpha += (medYaw - s.alpha) * EMA_ALPHA;
        s.beta += (medPitch - s.beta) * EMA_ALPHA;
        s.gamma += (medRoll - s.gamma) * EMA_ALPHA;

        // only update map at throttled rate
        if (now - lastMapUpdate >= MAP_UPDATE_MS && mapRef.current) {
          lastMapUpdate = now;

          // map euler -> lat/lng
          const alphaRad = (s.alpha * Math.PI) / 180;
          const latitude = Math.max(
            -85,
            Math.min(
              85,
              s.beta * Math.cos(alphaRad) - s.gamma * Math.sin(alphaRad)
            )
          );
          let longitude = ((s.alpha + 180) % 360) - 180;

          // clamp large jumps (helps reject spikes)
          const center = mapRef.current.getCenter();
          const clampedLat =
            Math.abs(center.lat - latitude) > MAX_DELTA_PER_UPDATE
              ? center.lat +
                Math.sign(latitude - center.lat) * MAX_DELTA_PER_UPDATE
              : latitude;
          const clampedLng =
            Math.abs(center.lng - longitude) > MAX_DELTA_PER_UPDATE
              ? center.lng +
                Math.sign(longitude - center.lng) * MAX_DELTA_PER_UPDATE
              : longitude;

          // finally update map with short easing
          mapRef.current.easeTo({
            center: [clampedLng, clampedLat],
            duration: Math.max(40, MAP_UPDATE_MS * 0.9),
            easing: (t) => t,
          });
        }
      }

      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [MAP_UPDATE_MS, mapRef]);
  // ...existing code...
  const toggleMode = useCallback((mode: string) => {
    setInputMode(mode);
  }, []);

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
