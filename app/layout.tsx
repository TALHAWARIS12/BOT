import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Al Bayan AI | Concierge Platform - Crest Grande (Tower A), Sobha Hartland",
  description: "Official 24/7 AI resident concierge system for Crest Grande - Tower A, Sobha Hartland, MBR City, Dubai. Instant access to amenities, visitor passes, maintenance, and building info in any language.",
  keywords: ["Crest Grande", "Sobha Hartland", "Tower A", "Dubai Concierge", "Al Bayan AI", "Luxury Resident Assistant", "Meydan", "Sobha Realty"],
  authors: [{ name: "Al Bayan AI Concierge Systems" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-canvas text-espresso antialiased flex flex-col selection:bg-gold selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
