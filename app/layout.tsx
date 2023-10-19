import { GeolocationProvider } from "@/components/geolocation-provider";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-[100svh] h-[100svh]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GeolocationProvider>{children}</GeolocationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
