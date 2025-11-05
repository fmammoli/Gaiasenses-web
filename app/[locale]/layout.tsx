import "../globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AudioContextProvider } from "@/hooks/webpd-context";
import RegisterPd4WebSW from "@/components/register-pd4web-sw";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { OrientationProvider } from "@/hooks/orientation-context";
import { WebRTCProvider } from "@/hooks/webrtc-context";
import { NextIntlClientProvider, useMessages } from "next-intl";
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
  const msg = useMessages();
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
        <NextIntlClientProvider locale={locale} messages={msg}>
          <RegisterPd4WebSW></RegisterPd4WebSW>
          <AudioContextProvider>{children}</AudioContextProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
