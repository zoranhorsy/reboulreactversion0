import React from "react";
import "@/app/globals.css";
import "@/styles/animation-utils.css";
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "./client-providers";
import { ClientSideLayout } from "@/components/layout/ClientSideLayout";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

// Utilisation de preload pour les polices
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Metadata optimisée
export const metadata: Metadata = {
  title: {
    default: "Reboul Store – Mode premium, sneakers et créateurs à Marseille, Cassis, Sanary",
    template: "%s | Reboul Store 2.0",
  },
  description:
    "Boutique premium à Marseille, Cassis et Sanary. Collections mode, sneakers et créateurs. Livraison rapide et expérience shopping unique.",
  keywords: ["mode", "vêtements", "premium", "design", "qualité"],
  authors: [{ name: "Reboul Store" }],
  creator: "Reboul Store",
  metadataBase: new URL("https://reboulstore.com"),
  icons: {
    icon: "/api/favicon",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://reboulstore.com",
    title: "Reboul Store - Mode Premium",
    description: "Boutique premium à Marseille, Cassis et Sanary. Collections mode, sneakers et créateurs. Livraison rapide et expérience shopping unique.",
    siteName: "Reboul Store",
    images: [
      {
        url: "https://reboulstore.com/og-image.jpg?v=2025-09-05-1",
        width: 1200,
        height: 630,
        alt: "Reboul Store",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reboul Store",
    description: "Boutique premium à Marseille, Cassis et Sanary. Collections mode, sneakers et créateurs. Livraison rapide et expérience shopping unique.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "2cShi_nuML5nZ4A596SC86B1aXj1rwT9OYX65woQIHY",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Favicon explicite pour forcer l'utilisation */}
        <link rel="icon" type="image/x-icon" href="/api/favicon" />
        {/* JSON-LD: Organization & Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Reboul Store',
                  url: 'https://reboulstore.com',
                  logo: 'https://reboulstore.com/api/favicon',
                },
                {
                  '@type': 'WebSite',
                  name: 'Reboul Store',
                  url: 'https://reboulstore.com',
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: 'https://reboulstore.com/catalogue?search={search_term_string}',
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`min-h-screen bg-background font-sans antialiased ${inter.className}`}
      >
        <ClientProviders>
          <ClientSideLayout>
            {children}
            <Footer />
          </ClientSideLayout>
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
