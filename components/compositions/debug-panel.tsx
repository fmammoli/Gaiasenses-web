"use client";
import { Button } from "@/components/ui/button";
import { SketchProps } from "@p5-wrapper/react";
import { FormEvent } from "react";
import DebugInput from "./debug-input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

type DebugPanelProps = {
  sketchProps: SketchProps;
  handlePlay: () => void;
  handlePause: () => void;
  handleChange: (newSketchProps: { [key: string]: number }) => void;
  handleStop: () => void;
};

export default function DebugPanel({
  sketchProps,
  handlePlay,
  handlePause,
  handleStop,
  handleChange,
}: DebugPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    let newSketchProps = { ...sketchProps };

    for (const key in newSketchProps) {
      const newValue = formData.get(key) as string | null;
      if (newValue) {
        newSketchProps[key] = parseFloat(newValue);
      }
    }
    const { containerHeight, play, ...rest } = newSketchProps;
  }

  function handleClick() {
    if (sketchProps.play) {
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
              <form onSubmit={handleSubmit}>
                {Object.entries(sketchProps).map((entry, index) => {
                  const name = entry[0];
                  const value = entry[1];
                  return (
                    name !== "play" && (
                      <DebugInput
                        key={index}
                        index={index}
                        name={name}
                        value={value as number}
                        handleChange={handleChange}
                      ></DebugInput>
                    )
                  );
                })}
              </form>
              <div>
                <Button id="play-button" className="mt-2" onClick={handleClick}>
                  {sketchProps.play ? "Pause" : "Play"}
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
