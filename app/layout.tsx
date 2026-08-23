import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Bayan AI | Crest Grande Tower A – Sobha Hartland Concierge",
  description:
    "Official 24/7 AI resident & guest concierge for Crest Grande Tower A, Sobha Hartland, MBR City, Dubai. Visitor passes, amenities, maintenance and building info in any language.",
  keywords: [
    "Crest Grande", "Sobha Hartland", "Tower A", "Dubai Concierge",
    "Al Bayan AI", "Luxury Resident Assistant", "Sobha Realty",
  ],
  authors: [{ name: "Al Bayan AI Concierge Systems" }],
  themeColor: "#231B17",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,           // allow pinch-zoom for accessibility
  viewportFit: "cover",      // handles iPhone notch / Dynamic Island
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA splash color */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full bg-canvas text-espresso antialiased flex flex-col selection:bg-gold selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
