import { ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
  return (
    <div className="my-4">
      <Label htmlFor={name} className="capitalize">{`${name}`}</Label>
      <div className="flex gap-2">
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
      </div>
    </div>
  );
}
