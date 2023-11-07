import { ChangeEvent, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useDebouncedCallback } from "use-debounce";

type DebugInputProps = {
  index: string | number;
  name: string;
  value: string;
  handleChange: (newSketchProp: { [key: string]: string }) => void;
};

export default function DebugInput({
  index,
  name,
  value,
  handleChange,
}: DebugInputProps) {
  const [text, setText] = useState<string>(value.toString());
  const debounce = useDebouncedCallback((text) => {
    handleChange({ [name]: text });
  }, 500);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
    debounce(event.target.value);
  }
  function handleSpin(spinValue: number) {
    setText(
      (
        Math.round(((parseFloat(value) + spinValue) * 1) / 0.5) /
        (1 / 0.5)
      ).toString()
    );
    handleChange({
      [name]: (
        Math.round(((parseFloat(value) + spinValue) * 1) / 0.5) /
        (1 / 0.5)
      ).toString(),
    });
  }
  return (
    <div className={`my-2`}>
      <div className="flex gap-2 justify-between">
        <Label
          htmlFor={name}
          className="capitalize text-xs"
        >{`${name}:`}</Label>
        <div className="flex gap-2">
          <Button onClick={() => handleSpin(-0.5)} className="">
            -
          </Button>
          <Input
            id={name}
            name={name}
            type="number"
            step={0.5}
            value={text}
            max={50}
            className="w-20 max-w-[5rem]"
            min={0}
            onChange={onChange}
          />
          <Button onClick={() => handleSpin(0.5)}>+</Button>
        </div>
      </div>
    </div>
  );
}
