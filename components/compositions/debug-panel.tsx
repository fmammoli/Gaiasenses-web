import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SketchProps } from "@p5-wrapper/react";
import { FormEvent } from "react";

type DebugPanelProps = {
  handleUpdate: (newSketchProps: SketchProps) => void;
  sketchProps: SketchProps;
  handlePlay?: () => void;
};

export default function DebugPanel({
  sketchProps,
  handleUpdate,
  handlePlay,
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
    handleUpdate(rest);
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
                <div key={index} className="my-4">
                  <Label
                    htmlFor={name}
                    className="capitalize"
                  >{`${name}`}</Label>
                  <div className="flex gap-2">
                    <Input
                      id={name}
                      name={name}
                      type="number"
                      inputMode="decimal"
                      step={0.01}
                      defaultValue={value as unknown as string | number}
                      className="w-20 max-w-[5rem]"
                    />
                  </div>
                </div>
              )
            );
          })}
          <Button type="submit" className="mt-4">
            Update
          </Button>
        </form>
        <Button id="play-button" className="mt-4" onClick={handlePlay}>
          {sketchProps.play ? "Stop" : "Play"}
        </Button>
      </div>
      <p className="text-xs mt-4">* Click on canvas to pause animation.</p>
    </div>
  );
}
