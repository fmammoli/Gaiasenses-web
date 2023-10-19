"use client";

import { useSearchParams } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

type CompositionContainerProps = {
  compositionData: {};
  compositionComponent: any;
};

export default function CompositionContainer({
  compositionData,
  compositionComponent,
}: CompositionContainerProps) {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const newData: { [key: string]: string } = {};
  Array.from(searchParams.entries()).forEach((item) => {
    if (item[0] !== "lat" && item[0] !== "lon") {
      newData[item[0]] = item[1];
    }
  });

  useLayoutEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(() => {
      if (ref.current) {
        console.log(ref.current.offsetHeight);
        setHeight(ref.current.offsetHeight);
      }
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [setHeight]);

  const Component = compositionComponent;
  return (
    <div className="relative h-full" ref={ref}>
      <Component
        {...compositionData}
        containerHeight={height}
        debug
      ></Component>
    </div>
  );
}
