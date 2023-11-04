"use client";
import { Button } from "@/components/ui/button";
import DebugInput from "./debug-input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type DebugPanelProps = {
  handlePlay: () => void;
  handlePause: () => void;
  handleStop: () => void;
};

export default function DebugPanel({
  handlePlay,
  handlePause,
  handleStop,
}: DebugPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sketchProps = Object.fromEntries(searchParams.entries());

  function handleChange(newSketchProp: { [key: string]: string }) {
    const newProps = { ...sketchProps, ...newSketchProp };
    const newSearchParams = new URLSearchParams(Object.entries(newProps));
    router.replace(`${pathname}?${newSearchParams.toString()}`);
  }

  function handleClick() {
    if (sketchProps.play === "true") {
      handlePause();
    } else {
      handlePlay();
    }
  }

  return (
    <>
      <div className="absolute max-w-[22rem] bg-secondary p-2 rounded-lg right-2 top-1/4 opacity-60 hover:opacity-100 z-50">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant={"outline"} className="mb-1 w-full">
              Debug Panel
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div>
              <div>
                {Object.entries(sketchProps)
                  .filter(
                    (entry) =>
                      entry[0] !== "lat" &&
                      entry[0] != "lon" &&
                      entry[0] != "play"
                  )
                  .map((entry, index) => {
                    const name = entry[0];
                    const value = entry[1];
                    return (
                      <DebugInput
                        key={index}
                        index={index}
                        name={name}
                        value={value}
                        handleChange={handleChange}
                      ></DebugInput>
                    );
                  })}
              </div>
              <div>
                <Button id="play-button" className="mt-2" onClick={handleClick}>
                  {sketchProps.play === "true" ? "Pause" : "Play"}
                </Button>
              </div>
              <div>
                <Button
                  variant={"outline"}
                  id="play-button"
                  className="mt-2"
                  onClick={handleStop}
                >
                  Reset
                </Button>
              </div>
              <p className="text-xs mt-2">
                * Click on canvas to play/pause animation.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
}
