"use client";
import GeolocationButton from "./geolocation-button";
import { H2 } from "@/components/ui/h2";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LocateFixedIcon, LocateIcon, MapIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LocationBar({
  city,
  state,
}: {
  city: string | null;
  state: string | null;
}) {
  const [geoState, setGeoState] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function checkPermission() {
      if (navigator && geoState === null) {
        const res = await navigator.permissions.query({ name: "geolocation" });
        setGeoState(res.state);
      }
    }
    checkPermission();
  }, [setGeoState, geoState]);

  function handleButton(newState: string) {
    setGeoState(newState);
  }

  return (
    <div>
      {city && (
        <>
          <div className="">
            <H2>{city}</H2>
            <h3>{state}</h3>
          </div>

          <div className="text-sm font-light font-mono mt-4">
            {geoState !== "granted" && (
              <p>Activate your GPS for better accuracy</p>
            )}
            <div className="flex flex-row gap-3 mt-2">
              {geoState !== "granted" && (
                <GeolocationButton setGeoState={handleButton}>
                  <LocateIcon />
                  <p>Activate GPS</p>
                </GeolocationButton>
              )}
              {geoState === "granted" && (
                <Button variant={"outline"} className="w-full gap-2" disabled>
                  <LocateFixedIcon />
                  <p>You GPS data is activated</p>
                </Button>
              )}
              <Button variant={"outline"}>
                <Link href={`/map?${searchParams.toString()}`}>
                  <MapIcon />
                </Link>
              </Button>
            </div>
          </div>
        </>
      )}
      {!city && (
        <>
          <div className="flex items-center justify-between">
            <GeolocationButton setGeoState={handleButton}>
              <p>Click Here to Activate Your GPS</p>
            </GeolocationButton>
          </div>
        </>
      )}
    </div>
  );
}
