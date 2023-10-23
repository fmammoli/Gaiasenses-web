"use client";

import {
  ReactElement,
  cloneElement,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import DebugPanel from "./debug-panel";

import useWebpd from "./use-webpd";

type ClientWrapper = {
  debug?: boolean;
  patchPath?: string;
  children: ReactElement;
  messages?: {
    nodeId: string;
    portletId: string;
    message: (string | number)[];
    valueIndex: number;
    name: string;
  }[];
};

export default function ClientWrapper({
  debug = false,
  patchPath,
  messages,
  children,
}: ClientWrapper) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [height, setHeight] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const [play, setPlay] = useState(false);

  const {
    WebPdScript,
    resume,
    status,
    suspend,
    sendMsgToWebPd,
    error,
    ready,
    start,
  } = useWebpd(patchPath);

  const Component = cloneElement(children, {
    ...children.props,
    containerHeight: height,
    play: play,
  });

  useLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(() => {
      if (ref.current && ref.current.offsetHeight > 0) {
        setHeight(ref.current.offsetHeight);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [setHeight]);

  async function handlePlay() {
    //play sound
    if (status === "waiting" && patchPath) {
      await start();
      await resume();
      console.log(messages);
      messages?.forEach((item) => {
        sendMsgToWebPd(item.nodeId, item.portletId, item.message);
      });
    }
    if (status === "started" || status == "playing") {
      console.log("já playing");
      suspend();
    }
    if (status === "suspended") {
      resume();
      messages?.forEach((item) => {
        sendMsgToWebPd(item.nodeId, item.portletId, item.message);
      });
    }
    //Play animation
    if (play) {
      setPlay(false);
    } else {
      setPlay(true);
    }
  }

  function handleUpdate(newSketchProps: { [key: string]: unknown }) {
    setPlay(false);
    if (status !== "waiting") suspend();

    const paramsString = Object.entries(newSketchProps)
      .map((entry) => `${entry[0]}=${entry[1]}`)
      .join("&");

    const geolocationParamsString = `lat=${searchParams.get(
      "lat"
    )}&lon=${searchParams.get("lon")}`;

    router.replace(`${pathname}?${geolocationParamsString}&${paramsString}`);
  }

  return (
    <div className="relative h-full" ref={ref}>
      {WebPdScript}
      {debug && (
        <DebugPanel
          sketchProps={Component.props}
          handleUpdate={handleUpdate}
          handlePlay={handlePlay}
        ></DebugPanel>
      )}
      {height > 0 && Component}
    </div>
  );
}
