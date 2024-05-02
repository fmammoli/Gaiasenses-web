"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode } from "react";

export default function PopupButton({
  compositionName,
  children,
}: {
  compositionName: string;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const handleClick = () => {
    if (compositionName) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("mode", "composition");
      newParams.set("compositionName", compositionName);
      newParams.set("play", "true");
      newParams.set("today", "true");
      newParams.set("initial", "false");
      router.replace(`${pathname}?${newParams.toString()}`);
    }
  };
  return (
    <Button
      className="text-xl w-full focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
      onClick={handleClick}
    >
      {children}
    </Button>
  );
}
