import { GeolocationProvider } from "@/components/geolocation-provider";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Inter, Montserrat, Poppins } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// const poppins = Poppins({
//   subsets: ["latin"],
//   variable: "--font-poppins",
//   weight: "400",
// });

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
      <body className={`${montserrat.className} min-h-[100svh] h-[100svh]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
