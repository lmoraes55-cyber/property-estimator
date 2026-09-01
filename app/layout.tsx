import type { Metadata } from "next";
import { Outfit, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/gtag";
import WelcomeToast from "@/components/WelcomeToast";
import "./globals.css";

// Display: geometric, used at light weights. This is what carries the
// "engineered" feel — the weight drop matters as much as the typeface.
const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// Body: has real character and excellent tabular figures, which a page full of
// rent tables needs.
const body = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// Figures, labels and eyebrows — the instrument-readout voice.
const mono = IBM_Plex_Mono({
  variable: "--font-mono-ai",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AssetIntel | Dubai Property Intelligence, Rental Strategy & STR Setup Advisory",
  description: "Property Intelligence. Smarter Decisions. AssetIntel helps Dubai property owners maximize rental income with data-driven STR and LTR strategy.",
  icons: {
    icon: [
      { url: "/brand/assetintel-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/assetintel-favicon-64.png", sizes: "64x64", type: "image/png" },
      { url: "/brand/assetintel-favicon-128.png", sizes: "128x128", type: "image/png" },
    ],
    apple: { url: "/brand/assetintel-favicon-256.png", sizes: "256x256", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {(GA_MEASUREMENT_ID || GOOGLE_ADS_ID) && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID || GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                ${GA_MEASUREMENT_ID ? `gtag('config', '${GA_MEASUREMENT_ID}');` : ""}
                ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
                window.gtag = gtag;
              `}
            </Script>
          </>
        )}
        {children}
        <WelcomeToast />
        <Analytics />
      </body>
    </html>
  );
}
