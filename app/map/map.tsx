"use client";

import { MyAudioContext } from "@/hooks/webpd-context";
import Leaflet, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import LocationMarker from "./location-marker";
import Link from "next/link";

export type MapProps = {
  lat: string | number;
  lon: string | number;
  children?: ReactNode;
};

const DEFAULT_POSITION = [-22.85, -47.12];
const DEFAULT_ZOOM = 10;
const DEFAULT_BOUNDS = [
  [-60, -100],
  [25, -30],
];
export default function Map(props: MapProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const lat = Number(props.lat) || DEFAULT_POSITION[0];
  const lng = Number(props.lon) || DEFAULT_POSITION[1];

  const { suspend, status } = useContext(MyAudioContext);

  // update Leaflet icons path
  // https://github.com/colbyfayock/next-leaflet-starter/blob/5f5cb801456138cdaa2ee454166b1b4bdbfcbb29/src/components/Map/DynamicMap.js#L17C3-L26C10
  useEffect(() => {
    (async function init() {
      // @ts-ignore
      delete Leaflet.Icon.Default.prototype._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "leaflet/marker-icon-2x.png",
        iconUrl: "leaflet/marker-icon.png",
        shadowUrl: "leaflet/marker-shadow.png",
      });
    })();
  }, []);

  const handleUpdatePosition = (lat: number, lon: number) => {
    status === "playing" && suspend && suspend();
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("lat", lat.toString());
    newParams.set("lon", lon.toString());
    newParams.set("play", false.toString());

    router.replace(`${pathname}?${newParams}`);
  };

  const handleSelectPosition = (lat: number, lon: number) => {
    const params = new URLSearchParams();
    params.set("lat", lat.toString());
    params.set("lon", lon.toString());

    //router.replace(`/?${params.toString()}`);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="">
      <MapContainer
        className="z-0"
        style={{ width: "100%", height: "100%" }}
        center={DEFAULT_POSITION as LatLngExpression}
        zoom={DEFAULT_ZOOM}
        minZoom={5}
        maxZoom={15}
        bounceAtZoomLimits={false}
        maxBounds={DEFAULT_BOUNDS as Leaflet.LatLngBoundsExpression}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <Link href="https://www.openstreetmap.org/copyright" scroll={false}>OpenStreetMap</Link> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={{ lat, lng }}
          onUpdateMarker={handleUpdatePosition}
          onSelectPosition={handleSelectPosition}
        >
          {props.children}
        </LocationMarker>
      </MapContainer>
    </div>
  );
}
