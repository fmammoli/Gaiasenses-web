"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Orientation = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

const OrientationContext = createContext<{
  orientation: Orientation | null;
  setOrientation: (o: Orientation) => void;
}>({
  orientation: null,
  setOrientation: () => {},
});

export function OrientationProvider({ children }: { children: ReactNode }) {
  const [orientation, setOrientation] = useState<Orientation | null>(null);

  return (
    <OrientationContext.Provider value={{ orientation, setOrientation }}>
      {children}
    </OrientationContext.Provider>
  );
}

export function useOrientation() {
  return useContext(OrientationContext);
}
