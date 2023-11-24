"use client";

import CompositionsInfo from "@/components/compositions/compositions-info";
import { Combobox } from "@/components/ui/combo-box";
import { MyAudioContext } from "@/hooks/webpd-context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useContext } from "react";

const compositions = Object.entries(CompositionsInfo).map((item) => {
  const newItem = {
    label: item[1].name,
    value: item[0],
  };
  return newItem;
});

export default function CompositionsCombobox() {
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

  return <Combobox options={compositions} onSelect={handleSelect}></Combobox>;
}
