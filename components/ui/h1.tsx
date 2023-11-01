import { ReactNode } from "react";

export function H1({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-mont scroll-m-20 text-2xl md:text-4xl font-extrabold tracking-tight lg:text-5xl">
      {children}
    </h1>
  );
}
