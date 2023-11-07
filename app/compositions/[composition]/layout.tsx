import type { Metadata } from "next";
import BackButton from "./back-button";
import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";
import WebPdScript from "@/components/webpd-script";
import { AudioContextProvider } from "@/hooks/webpd-context";

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
    <main className="grid grid-rows-[120px_1fr] grid-cols-1 h-full w-full relative">
      <div className="row-start-1 row-end-3 col-start-1 col-end-2">
        {children}
      </div>
      <div className="row-start-1 row-end-2 col-start-1 col-end-1 z-10">
        <nav className="flex px-2 py-8 md:p8 justify-between z-50 max-w-xl mx-auto items-center">
          <BackButton></BackButton>
          <H1>GaiaSensesWeb</H1>
          <ModeToggle></ModeToggle>
        </nav>
      </div>
    </main>
  );
}
