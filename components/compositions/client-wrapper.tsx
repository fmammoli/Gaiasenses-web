"use client";

import { ReactElement, cloneElement } from "react";

import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import useWebpd from "../../hooks/use-webpd";
import DebugPanel from "./debug-panel";
import TogglePlayButton from "./toggle-play-button";

//From nextjs ecommerce example
//https://github.com/vercel/commerce/blob/main/lib/utils.ts
export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

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

//TO-DO
//There are a bunch of stuff here that should probably be at the debug panel,
//they shouldonly exist in debug state. This will probably reduce re-renders.

export default function ClientWrapper({
  debug = false,
  patchPath,
  messages,
  children,
}: ClientWrapper) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const newParams = new URLSearchParams(searchParams.toString());

  const { resume, status, suspend, sendMsgToWebPd, start } =
    useWebpd(patchPath);

  const Component = cloneElement(children, {
    ...children.props,
  });

  if (status === "playing") {
    messages?.forEach((item) => {
      sendMsgToWebPd(item.nodeId, item.portletId, item.message);
    });
  }

  async function handlePause() {
    newParams.set("play", false.toString());
    router.replace(`${pathname}?${newParams.toString()}`);
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

    newParams.set("play", true.toString());
    router.replace(`${pathname}?${newParams.toString()}`);
  }

  function handleStop() {
    handlePause();
    router.refresh();
  }

  return (
    <>
      <div className="relative h-full">
        {debug && (
          <DebugPanel
            handlePlay={handlePlay}
            handlePause={handlePause}
            handleStop={handleStop}
          ></DebugPanel>
        )}

        <TogglePlayButton
          play={newParams.get("play") === "false" ? false : true}
          onPlay={handlePlay}
          onPause={handlePause}
        ></TogglePlayButton>

        {Component}
      </div>
    </>
  );
}
