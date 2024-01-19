"use client";

import { Combobox } from "@/components/ui/combo-box";
import { MyAudioContext } from "@/hooks/webpd-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";

export default function CompositionsCombobox({ options, initial }: { 
  options: { value: string; label: string }[];
  initial?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { currentPatch, closeSound, status, setStatus } =
    useContext(MyAudioContext);

  function handleSelect(currentValue: string) {
    closeSound && closeSound();
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("composition", currentValue);
    newParams.set("play", "false");
    router.push(`${pathname}?${newParams}`);
  }

  return <Combobox options={options} initial={initial} onSelect={handleSelect}></Combobox>;
}
