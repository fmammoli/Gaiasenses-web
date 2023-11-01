"use client";

import { Button } from "@/components/ui/button";
import { SewingPinFilledIcon } from "@radix-ui/react-icons";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function GeolocationButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  function onSucess(position: GeolocationPosition) {
    console.log(position.coords);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("lat", position.coords.latitude.toString());
    newParams.set("lon", position.coords.longitude.toString());

    router.replace(`${pathname}?${newParams.toString()}`);
  }

  function onError(positionError: GeolocationPositionError) {
    console.log(positionError);
  }

  async function onClick() {
    if (navigator) {
      const result = await navigator.permissions.query({ name: "geolocation" });
      alert(result.state);
      if (result.state === "granted") {
        console.log("You already have permission");
      } else if (result.state === "prompt") {
        navigator.geolocation.getCurrentPosition(onSucess, onError, {
          timeout: 3000,
        });
      } else if (result.state === "denied") {
        console.log("denid");
      }
    }
  }
  return (
    <Button size={"icon"} onClick={onClick}>
      <SewingPinFilledIcon className=""></SewingPinFilledIcon>
    </Button>
  );
}
