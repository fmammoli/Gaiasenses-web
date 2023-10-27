"use client";

import {
  ReactElement,
  cloneElement,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import useWebpd from "../../hooks/use-webpd";
import DebugPanel from "./debug-panel";

type ClientWrapper = {
  debug?: boolean;
  patchPath?: string;
  children: ReactElement & {
    props: { containerHeight: number; play: boolean };
  };
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

  if (status === "playing") {
    messages?.forEach((item) => {
      sendMsgToWebPd(item.nodeId, item.portletId, item.message);
    });
  }

  async function handlePause() {
    setPlay(false);
    if (status === "started" || status == "playing") {
      suspend();
    }
  }

  async function handlePlay() {
    //play sound
    if (status === "waiting" && patchPath) {
      await start();
      await resume();
      messages?.forEach((item) => {
        sendMsgToWebPd(item.nodeId, item.portletId, item.message);
      });
    }
    if (status === "suspended") {
      resume();
    }
    //Play animation
    if (play) {
      setPlay(false);
    } else {
      setPlay(true);
    }
  }

  async function handleChange(newSketchProp: { [key: string]: number }) {
    const { containerHeight, play, ...sketchProps } = children.props;

    const paramsString = Object.entries({
      ...sketchProps,
      ...newSketchProp,
    })
      .map((entry) => `${entry[0]}=${entry[1]}`)
      .join("&");

    const geolocationParamsString = `lat=${searchParams.get(
      "lat"
    )}&lon=${searchParams.get("lon")}`;

    router.replace(`${pathname}?${geolocationParamsString}&${paramsString}`);
  }

  function handleStop() {
    handlePause();
    router.refresh();
  }

  return (
    <div className="relative h-full" ref={ref}>
      {WebPdScript}
      {debug && (
        <DebugPanel
          sketchProps={Component.props}
          handlePlay={handlePlay}
          handlePause={handlePause}
          handleChange={handleChange}
          handleStop={handleStop}
        ></DebugPanel>
      )}
      {height > 0 && Component}
    </div>
  );
}
