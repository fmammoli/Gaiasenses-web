import { ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

type DebugInputProps = {
  index: string | number;
  name: string;
  value: number;
  handleChange: (newSketchProp: { [key: string]: number }) => void;
};

export default function DebugInput({
  index,
  name,
  value,
  handleChange,
}: DebugInputProps) {
  function onChange(event: ChangeEvent<HTMLInputElement>) {
    handleChange({ [name]: parseFloat(event.target.value) });
  }
  function handleSpin(spinValue: number) {
    handleChange({ [name]: value + spinValue });
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
            value={(value as number | typeof NaN).toString()}
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
