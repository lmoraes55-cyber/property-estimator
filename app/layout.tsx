import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { GA_MEASUREMENT_ID, GOOGLE_ADS_ID } from "@/lib/gtag";
import WelcomeToast from "@/components/WelcomeToast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
      </body>
    </html>
  );
}
