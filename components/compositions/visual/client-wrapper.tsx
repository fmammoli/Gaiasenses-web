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
import { SketchProps } from "@p5-wrapper/react";

type ClientWrapper = {
  debug?: boolean;
  children: ReactElement;
};

export default function ClientWrapper({
  debug = false,
  children,
}: ClientWrapper) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [height, setHeight] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const newProps = { ...children.props };

  for (const key in newProps) {
    newProps[key] = searchParams.get(key);
  }

  const Component = cloneElement(children, {
    ...newProps,
    containerHeight: height,
  });

  useLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(() => {
      if (ref.current) {
        setHeight(ref.current.offsetHeight);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [setHeight]);

  function handleUpdate(newSketchProps: SketchProps) {
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
      {debug && (
        <DebugPanel
          sketchProps={children.props}
          handleUpdate={handleUpdate}
        ></DebugPanel>
      )}

      {Component}
    </div>
  );
}
