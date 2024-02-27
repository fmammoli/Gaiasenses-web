"use client";

import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function FadeContainer({
  children,
  play,
  mode = "map",
  map,
  composition,
}: {
  play: boolean;
  children?: ReactNode;
  mode: "map" | "composition";
  map?: ReactNode;
  composition?: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams) {
      if (play) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set("mode", "map");
        //newParams.delete("compositionName");
        newParams.set("play", "false");
        newParams.set("today", "false");
        newParams.set("initial", "false");
        const timeout = setTimeout(() => {
          router.replace(`${pathname}?${newParams.toString()}`);
        }, 60000);
        return () => {
          clearTimeout(timeout);
        };
      }
    }
  }, [searchParams, pathname, router, play]);

  return (
    <>
      <div
        className={cn(
          "h-svh relative bg-black",
          mode === "composition" && "animate-fade z-10",
          mode === "map" ? "animate-my-fade-out -z-10" : ""
          //fadeOutState === "ended" || (fadeOutState === "idle" && "-z-10")
        )}
      >
        {children}
      </div>
    </>
  );
}
