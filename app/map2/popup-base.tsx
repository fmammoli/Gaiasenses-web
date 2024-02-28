"use client";
import { ReactNode } from "react";
import { Popup } from "react-map-gl";

export default function PopupBase({
  latitude,
  longitude,
  children,
}: {
  latitude: number;
  longitude: number;
  children?: ReactNode;
}) {
  return (
    <Popup
      offset={38}
      latitude={latitude}
      longitude={longitude}
      closeButton={false}
      maxWidth={"40rem"}
      anchor="bottom"
    >
      {children}
    </Popup>
  );
}
