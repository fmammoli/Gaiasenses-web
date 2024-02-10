"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const COMPOSITITON_DURATION = 10000;

export default function AutoFadeContainer({
  show,
  timeout,
  children,
  compositionName,
}: {
  show: boolean;
  timeout: number;
  children: ReactNode;
  compositionName?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (show && searchParams.has("timed")) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("mode", "map");
      //   newParams.delete("compositionName");
      newParams.set("play", "false");
      newParams.set("today", "false");
      newParams.set("initial", "false");
      const timeoutId = setTimeout(() => {
        router.replace(`${pathname}?${newParams}`);
      }, 18000);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [router, pathname, searchParams, show, compositionName]);

  let animationClass = "";
  if (show) {
    if (searchParams.has("timed")) {
      animationClass = "animate-composition-fade";
    } else {
      animationClass =
        "z-10 animate-fade animate-once animate-duration-[2s]  animate-ease-[cubic-bezier(0.950, 0.050, 0.795, 0.035)] animate-normal animate-fill-forward";
    }
  }

  return (
    <div
      //   className={`absolute h-full top-0 left-0 w-full bg-black isolate transition-opacity duration-1000  ${
      //     show ? "delay-400 z-10 opacity-100" : "-z-10 opacity-0"
      //   }`}
      className={`absolute h-full top-0 left-0 w-full isolate will-change-auto opacity-0 bg-black ${
        show ? `z-10 ${animationClass}` : "-z-10"
      }`}
      // className={`absolute h-full top-0 left-0 w-full isolate will-change-auto bg-black ${
      //   animationState ? "animate-my-fade-in" : ""
      // } ${show ? "z-10 " : "-z-10"}`}
    >
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
