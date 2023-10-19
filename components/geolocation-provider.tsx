"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { createContext, ReactNode, useEffect } from "react";
import { useGeolocated } from "react-geolocated";

export const GeolocationContext = createContext({});

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { coords, isGeolocationAvailable, isGeolocationEnabled } =
    useGeolocated({
      positionOptions: { enableHighAccuracy: false },
      userDecisionTimeout: 10000,
    });

  useEffect(() => {
    if (coords) {
      if (
        coords.latitude.toString() !== searchParams.get("lat") &&
        coords.longitude.toString() !== searchParams.get("lon")
      ) {
        let newSearchParams: string[] = [
          `lat=${coords.latitude}`,
          `lon=${coords.longitude}`,
        ];
        if (searchParams.size > 0) {
          searchParams.forEach((value, key) => {
            console.log(`${key}=${value}`);
            if (key !== "lat" && key !== "lon") {
              newSearchParams.push(`${key}=${value}`);
            }
          });
        }
        router.replace(`${pathname}?${newSearchParams.join("&")}`);
      }
    }
  }, [coords, searchParams, router, pathname]);

  const value = { coords, isGeolocationAvailable, isGeolocationEnabled };
  return (
    <GeolocationContext.Provider value={value}>
      {children}
    </GeolocationContext.Provider>
  );
}
