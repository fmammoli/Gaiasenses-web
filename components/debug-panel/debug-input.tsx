import { ChangeEvent, useEffect, useState } from "react";
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
  const [text, setText] = useState<string>(value?.toString() ?? "");
  const debounce = useDebouncedCallback((textVal: string) => {
    handleChange({ [name]: textVal });
  }, 500);

  useEffect(() => {
    setText(value?.toString() ?? "");
  }, [value]);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
    debounce(event.target.value);
  }

  function handleSpin(spinValue: number) {
    const current = parseFloat(text || "0") || 0;
    const step = 1;
    const newVal = Math.round((current + spinValue) / step) * step;
    const newText = String(Number.isFinite(newVal) ? newVal : 0);
    setText(newText);
    handleChange({ [name]: newText });
  }

  return (
    <div className={`my-2`}>
      <div className="flex gap-2 justify-between">
        <Label htmlFor={name} className="capitalize text-xs">
          {`${name}:`}
        </Label>
        <div className="flex gap-2">
          <Button onClick={() => handleSpin(-1)} className="">
            -
          </Button>
          <Input
            id={name}
            name={name}
            type="number"
            step={1}
            value={text}
            max={9999}
            className="w-20 max-w-[5rem]"
            min={0}
            onChange={onChange}
          />
          <Button onClick={() => handleSpin(1)}>+</Button>
        </div>
      </div>
    </div>
  );
}
