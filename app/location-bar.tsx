import { P } from "@/components/ui/p";
import GeolocationButton from "./geolocation-button";
import { H2 } from "@/components/ui/h2";

export default async function LocationBar({
  city,
  state,
}: {
  city: string | null;
  state: string | null;
}) {
  return (
    <div>
      {city && state && (
        <>
          <div className="flex items-center justify-between">
            <H2>
              {city} - {state}
            </H2>
            <GeolocationButton></GeolocationButton>
          </div>

          <div className="text-sm font-light font-mono">
            <P>Cloudy, with a chance of meatballs</P>
          </div>
        </>
      )}
      {(!city || !state) && (
        <>
          <div className="flex items-center justify-between">
            <H2>Please activate your gps</H2>
            <GeolocationButton></GeolocationButton>
          </div>
        </>
      )}
    </div>
  );
}
