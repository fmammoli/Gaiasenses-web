"use client";
import { P } from "@/components/ui/p";
import GeolocationButton from "./geolocation-button";
import { H2 } from "@/components/ui/h2";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SewingPinFilledIcon } from "@radix-ui/react-icons";

export default function LocationBar({
  city,
  state,
}: {
  city: string | null;
  state: string | null;
}) {
  const [geoState, setGeoState] = useState<string | null>(null);

  useEffect(() => {
    async function checkPermission() {
      if (navigator && geoState === null) {
        console.log("checking permission");
        const res = await navigator.permissions.query({ name: "geolocation" });
        setGeoState(res.state);
      }
    }
    checkPermission();
  }, [setGeoState, geoState]);

  function handleButton(newState: string) {
    console.log(newState);
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

          <div className="text-sm font-light font-mono">
            {geoState !== "granted" && (
              <>
                <p className="my-4">Activate you GPS for better accurcy.</p>
                <GeolocationButton setGeoState={handleButton}>
                  <p>Activate GPS</p>
                </GeolocationButton>
              </>
            )}
            {geoState === "granted" && (
              <Button variant={"outline"} className="w-full mt-4">
                <p>You GPS data is activated.</p>
                <SewingPinFilledIcon className=""></SewingPinFilledIcon>
              </Button>
            )}
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
