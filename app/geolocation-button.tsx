"use client";

import { Button } from "@/components/ui/button";
import { SewingPinFilledIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";

export default function GeolocationButton({
  children,
  setGeoState,
}: {
  children?: ReactNode;
  setGeoState: (newState: string) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<string | null>(null);

  function onSucess(position: GeolocationPosition) {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("lat", position.coords.latitude.toString());
    newParams.set("lon", position.coords.longitude.toString());
    setState("granted");
    setGeoState("granted");
    router.replace(`${pathname}?${newParams.toString()}`);
    router.refresh();
  }

  function onError(positionError: GeolocationPositionError) {
    console.log(positionError);
    alert(positionError);
    setGeoState("error: " + positionError.message);
  }

  async function onClick() {
    if (navigator) {
      const result = await navigator.permissions.query({ name: "geolocation" });
      //alert(result.state);
      if (result.state === "granted") {
        console.log("You already have permission");
      } else if (result.state === "prompt") {
        navigator.geolocation.getCurrentPosition(onSucess, onError, {
          timeout: 5000,
        });
      } else if (result.state === "denied") {
        console.log("denid");
      }
      setState(result.state);
      setGeoState(result.state);
    }
  }
  return (
    <Button className="w-full" onClick={onClick}>
      {children}
      <SewingPinFilledIcon className=""></SewingPinFilledIcon>
    </Button>
  );
}
