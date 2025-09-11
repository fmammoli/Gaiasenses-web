"use client";
import { Button } from "@/components/ui/button";
import DebugInput from "./debug-input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function DebugPanel({ data }: { data: { [key: string]: number }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (searchParams.get("debug") !== "true") return null;

  const sketchProps: { [k: string]: string } = Object.fromEntries(
    Array.from(searchParams?.entries() ?? [])
  );

  const defaults = Object.assign({}, ...data) as { [key: string]: number };

  const attributes = Array.from(new Set(data.flatMap((obj) => Object.keys(obj)))).sort();

  function handleChange(newSketchProp: { [key: string]: string }) {
    const newProps = { ...sketchProps, ...newSketchProp };
    const newSearchParams = new URLSearchParams(Object.entries(newProps));
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  }

  function handleResetToDefaults() {
    const newProps: { [key: string]: string } = { ...sketchProps };

    attributes.forEach((attr) => {
      if (defaults[attr] !== undefined) newProps[attr] = String(defaults[attr]);
      else newProps[attr] = "0";
    });

  const newSearchParams = new URLSearchParams(Object.entries(newProps));
  router.replace(`${pathname}?${newSearchParams.toString()}`);
}

  return (
    <div className="absolute max-w-[22rem] bg-secondary p-2 rounded-lg right-2 top-1/4 opacity-60 hover:opacity-100 z-50">
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant={"outline"} className="mb-1 w-full text-xs">
            Debug Panel
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div>
            <div>
              {attributes.map((attr, index) => (
                <DebugInput
                  key={index}
                  index={index}
                  name={attr}
                  value={sketchProps[attr] ?? (defaults[attr] !== undefined ? String(defaults[attr]) : "")}
                  handleChange={handleChange}
                />
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <Button variant={"outline"} id="reset-button" onClick={handleResetToDefaults}>
                Reset to default
              </Button>
            </div>

            <p className="text-xs mt-2">
              * Alter the satellite data values to tinker with the animation.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}