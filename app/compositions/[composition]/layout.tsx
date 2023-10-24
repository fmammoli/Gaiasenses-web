import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BackButton from "./back-button";
import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";

export const metadata: Metadata = {
  title: "GaiaSenses Web",
  description: "Web version of GaiaSensesApp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid grid-rows-[120px_1fr] grid-cols-1 h-full w-full  relative">
      <div className="row-start-1 row-end-3 col-start-1 col-end-2 h-full">
        {children}
      </div>
      <div className="row-start-1 row-end-1 col-start-1 col-end- z-10">
        <nav className="flex p-8 justify-between z-50">
          <BackButton></BackButton>
          <H1>GaiaSensesWeb</H1>
          <ModeToggle></ModeToggle>
        </nav>
      </div>
    </main>
  );
}
