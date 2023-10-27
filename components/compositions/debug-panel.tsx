import { Button } from "@/components/ui/button";
import { SketchProps } from "@p5-wrapper/react";
import { FormEvent } from "react";
import DebugInput from "./debug-input";

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
    <div className="absolute max-w-[10rem] bg-secondary p-4 rounded-lg right-2 top-1/4 opacity-60 hover:opacity-100">
      <p className="text-center mb-2">Debug Panel</p>
      <div>
        <form onSubmit={handleSubmit}>
          {Object.entries(sketchProps).map((entry, index) => {
            const name = entry[0];
            const value = entry[1];
            return (
              name !== "containerHeight" &&
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
        <Button id="play-button" className="mt-4" onClick={handleClick}>
          {sketchProps.play ? "Pause" : "Play"}
        </Button>
        <Button
          variant={"outline"}
          id="play-button"
          className="mt-4"
          onClick={handleStop}
        >
          Reset
        </Button>
      </div>
      <p className="text-xs mt-4">* Click on canvas to pause animation.</p>
    </div>
  );
}
