"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AnimationEvent,
  ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useTransition, animated } from "@react-spring/web";
import { useSpringRef } from "react-spring";

export default function FadeContainer({
  children,
  play,
}: {
  play: boolean;
  children?: ReactNode;
}) {
  const [fadeInState, setFadeInState] = useState<
    "idle" | "animating" | "ended"
  >("idle");
  const [fadeOutState, setFadeOutState] = useState<
    "idle" | "animating" | "ended"
  >("idle");

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // useEffect(() => {
  //   if (searchParams) {
  //     if (searchParams.get("play") === "true") {
  //       const newParams = new URLSearchParams(searchParams.toString());
  //       newParams.set("mode", "map");
  //       //newParams.delete("compositionName");
  //       newParams.set("play", "false");
  //       newParams.set("today", "false");
  //       newParams.set("initial", "false");
  //       const timeout = setTimeout(() => {
  //         router.replace(`${pathname}?${newParams.toString()}`);
  //       }, 10000);
  //       return () => {
  //         clearTimeout(timeout);
  //       };
  //     }
  //   }
  // }, [searchParams, pathname, router]);

  function onAnimationStart(e: AnimationEvent<HTMLDivElement>) {
    console.log("Animation start: ", e.animationName);
    if (e.animationName === "fade") {
      setFadeInState("animating");
    }
    if (e.animationName === "my-fade-out-k") {
      setFadeOutState("animating");
    }
  }

  function onAnimationEnd(e: AnimationEvent<HTMLDivElement>) {
    console.log("Animation ended: ", e.animationName);
    if (e.animationName === "fade") {
      setFadeInState("ended");
    }
    if (e.animationName === "my-fade-out-k") {
      setFadeOutState("ended");
    }
  }
  console.log(
    "Play: ",
    play,
    " Fade in: ",
    fadeInState,
    " Fade out: ",
    fadeOutState
  );

  let animation = "";
  // if (play === false && fadeInState === "idle") {
  //   animation = "";
  // }
  // if (play === true && fadeInState === "idle") {
  //   animation = "animate-fade animate-duration-[2000]";
  // }
  // if (play === true && fadeInState === "animating") {
  //   animation = "animate-fade animate-duration-[2000]";
  // }

  const transRef = useSpringRef();

  const transitions = useTransition(play, {
    ref: transRef,
    keys: null,
    from: { opacity: 0, transform: "translate3d(100%,0,0)" },
    enter: { opacity: 1, transform: "translate3d(0%,0,0)" },
    leave: { opacity: 0, transform: "translate3d(-50%,0,0)" },
  });

  useEffect(() => {
    transRef.start();
  }, [play, transRef]);

  return (
    <div>
      {transitions((style, i) => {
        console.log(style);
        console.log(i);
        return (
          <animated.div className={cn("bg-black h-svh relative")}>
            {children}
          </animated.div>
        );
      })}
    </div>
  );
}
