"use client";

import { useSearchParams } from "next/navigation";
import type { MapRef } from "react-map-gl";

import Pd4WebMapAudio from "./pd4web-map-audio";
import {
  resolveMap3Pd4WebPatch,
  type Map3Pd4WebMoment,
} from "./pd4web-patches";

type Pd4WebMapAudioManagerProps = {
  mapRef: React.RefObject<MapRef>;
};

function normalizeMoment(value: string | null): Map3Pd4WebMoment {
  return value === "player" ? "player" : "map";
}

export default function Pd4WebMapAudioManager({
  mapRef,
}: Pd4WebMapAudioManagerProps) {
  const searchParams = useSearchParams();
  const moment = normalizeMoment(searchParams.get("mode"));
  const composition = searchParams.get("composition");

  const activePatch = resolveMap3Pd4WebPatch({
    moment,
    composition,
  });

  if (!activePatch) {
    return null;
  }

  return (
    <Pd4WebMapAudio key={activePatch.id} patch={activePatch} mapRef={mapRef} />
  );
}
