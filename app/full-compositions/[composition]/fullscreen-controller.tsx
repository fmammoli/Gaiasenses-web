"use client";

import { useRef, useEffect, ReactNode } from "react";

export default function FullscreenController({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      console.log(ref);
      try {
        ref.current.requestFullscreen();
      } catch (error) {
        console.log(error);
      }
    }
  }, []);
  return <div ref={ref}>{children}</div>;
}
