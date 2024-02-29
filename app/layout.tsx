import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AudioContextProvider } from "@/hooks/webpd-context";

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

//The AudioContextProvider here at the root layout may not be a very good idea.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className}`}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
        </ThemeProvider> */}
        <AudioContextProvider>{children}</AudioContextProvider>
      </body>
    </html>
  );
}
