"use client";

import CompositionsInfo from "@/components/compositions/compositions-info";
import { Combobox } from "@/components/ui/combo-box";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

  function handleSelect(currentValue: string) {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("composition", currentValue);
    newParams.set("play", "false");
    router.push(`${pathname}?${newParams}`);
  }

  return <Combobox options={compositions} onSelect={handleSelect}></Combobox>;
}
