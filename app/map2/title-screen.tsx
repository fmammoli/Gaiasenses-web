"use client";
import { Button } from "@/components/ui/button";

import { ReactNode, useState, AnimationEvent } from "react";

export default function TitleScreen({
  children,
  show,
}: {
  children?: ReactNode;
  show: boolean;
}) {
  const [state, setState] = useState<"idle" | "animating" | "ended">(
    show === false ? "ended" : "idle"
  );

  function onClick() {
    console.log(state);
    if (state == "idle") setState("animating");
  }

  function onAnimationEnd(e: AnimationEvent<HTMLDivElement>) {
    e.stopPropagation();
    setState("ended");
  }

  return (
    <div
      className={`top-0 left-0 w-full grid h-full content-center gap-10 mix-blend-darken bg-black relative ${
        (state === "animating" || state === "ended") && "animate-title-page"
      } ${state === "ended" && "-z-50"}`}
      onAnimationEnd={onAnimationEnd}
    >
      <div className="max-w-full  md:max-w-[40rem] self-center justify-self-center px-2">
        <h1 className="text-white font-extrabold leading-[0.7em] text-[5rem] md:text-[10rem]">
          Gaia Senses
        </h1>
      </div>
      <div className=" self-center justify-self-center max-w-full  md:max-w-[40rem] px-2 ">
        <h2 className="text-white text-[2rem] md:text-[4rem] font-pop font-semibold leading-tight md:leading-[0.9em] [text-shadow:_0px_1px_1px_rgba(255,255,255,0.6)]">
          Ressonâncias Climáticas
        </h2>
      </div>
      <div className=" self-center justify-self-center max-w-full  md:max-w-[40rem] px-2 isolation-auto">
        <Button
          variant={"link"}
          className="text-white text-[2rem] md:text-[2rem] font-pop font-semibold leading-tight md:leading-[0.9em] [text-shadow:_0px_1px_1px_rgba(255,255,255,0.6)] z-50"
          onClick={onClick}
        >
          Iniciar
        </Button>
      </div>
    </div>
  );
}
