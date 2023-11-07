import { ReactNode } from "react";

export default function Composition({ children }: { children: ReactNode }) {
  return <div className="relative h-full">{children}</div>;
}
