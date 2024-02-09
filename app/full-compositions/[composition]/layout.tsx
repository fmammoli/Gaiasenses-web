import type { Metadata } from "next";

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
    </main>
  );
}
