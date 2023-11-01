import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ReactNode } from "react";
export default async function TopBar({ children }: { children: ReactNode }) {
  return (
    <nav className="p-4">
      <div className="flex items-center justify-between p-4">
        <div className="grow text-center">
          <H1>GaiaSensesWeb</H1>
        </div>
        <ModeToggle></ModeToggle>
      </div>
      <div className="bg-accent p-4">{children}</div>
    </nav>
  );
}
