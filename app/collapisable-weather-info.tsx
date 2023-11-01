"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { SewingPinFilledIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import GeolocationButton from "./geolocation-button";

export default function CollapisableWeatherInfo() {
  const [isOpen, setOpen] = useState(false);
  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent>
        <div>
          <div>
            <p>A</p>
          </div>
          <div>
            <p>A</p>
          </div>
          <div>
            <p>A</p>
          </div>
          <div>
            <p>A</p>
          </div>
        </div>
      </CollapsibleContent>
      <div className="flex items-center justify-between">
        <p className="text-white text-xl font-bold">Campinas - SP</p>
      </div>
      <GeolocationButton></GeolocationButton>
      <div className="text-white text-sm font-light font-mono">
        <p>Cloudy, with a chance of meatballs</p>
      </div>
    </Collapsible>
  );
}
