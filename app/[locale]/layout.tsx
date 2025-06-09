import "../globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AudioContextProvider } from "@/hooks/webpd-context";
import RegisterPd4WebSW from "@/components/register-pd4web-sw";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { OrientationProvider } from "@/hooks/orientation-context";
import { WebRTCProvider } from "@/hooks/webrtc-context";
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

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${montserrat.className}`}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
        </ThemeProvider> */}
        <RegisterPd4WebSW></RegisterPd4WebSW>
        <OrientationProvider>
          <WebRTCProvider>
            <AudioContextProvider>{children}</AudioContextProvider>
          </WebRTCProvider>
        </OrientationProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
