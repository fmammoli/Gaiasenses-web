"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import USFlagIcon from "./us-flag-icon";
import BRFlagIcon from "./br-flag-icon";

const options = [
  { value: "en", label: <USFlagIcon></USFlagIcon> },
  { value: "pt", label: <BRFlagIcon></BRFlagIcon> },
];

export default function CountrySelect() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initial = options.findIndex(
    (item) => item.value === pathname.split("/")[1]
  );

  function handleSelect(currentValue: string) {
    if (currentValue === "en" || currentValue === "pt") {
      router.push(
        `/${currentValue}/${pathname.split("/")[2]}?${searchParams.toString()}`
      );
    }
  }
  console.log(initial);
  return (
    <Combobox
      options={options}
      initial={initial ?? 0}
      onSelect={handleSelect}
    ></Combobox>
  );
}

function Combobox({
  options,
  initial = 0,
  onSelect,
}: {
  options: { value: string; label: string | React.ReactNode }[];
  initial?: number;
  onSelect?: (currentValue: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(options[initial].value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between text-foreground min-w-fit p-0 h-[28px] rounded-[4px] px-2 border-0 hover:bg-gray-100 active:gray-100"
          size={"icon"}
        >
          <div className="h-5 w-5 flex items-center">
            {value
              ? options.find((item) => item.value === value)?.label
              : "Select a language..."}
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandGroup>
            {options.map((item) => {
              return (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    if (currentValue !== "" && onSelect) {
                      onSelect(currentValue);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="h-8 w-8 flex items-center">{item.label}</div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
