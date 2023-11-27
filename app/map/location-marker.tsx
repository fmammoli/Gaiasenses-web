"use client";
import Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { PropsWithChildren, useEffect, useRef } from "react";
import { Marker, Popup, useMap, useMapEvents } from "react-leaflet";

type LocationMarkerProps = PropsWithChildren<{
  position: Leaflet.LatLngLiteral;
  onUpdateMarker?: (lat: number, lon: number) => void;
  onSelectPosition?: (lat: number, lon: number) => void;
}>;

export default function LocationMarker(props: LocationMarkerProps) {
  const map = useMap();

  const markerRef = useRef(null);

  useEffect(() => {
    // the props set for the `MapContainer` are immutable
    // and only applied on the first render. To reflect
    // position updates we must imperatively set the map's
    // center coordinate
    map.setView(props.position);
  }, [props.position, map]);

  useMapEvents({
    click: (e) => {
      if (props.onUpdateMarker !== undefined) {
        props.onUpdateMarker(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return (
    props.position && (
      <Marker position={props.position} ref={markerRef}>
        <Popup>{props.children}</Popup>
      </Marker>
    )
  );
}
