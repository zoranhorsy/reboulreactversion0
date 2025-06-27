import React from "react";
import "@/app/globals.css";
import "@/styles/animation-utils.css";
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "./client-providers";
import { ClientSideLayout } from "@/components/layout/ClientSideLayout";

// Utilisation de preload pour les polices
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Metadata optimisée
export const metadata: Metadata = {
  title: {
    default: "Reboul Store - Boutique de mode premium",
    template: "%s | Reboul Store",
  },
  description:
    "Découvrez la collection exclusive de vêtements et accessoires de mode premium chez Reboul Store. Qualité exceptionnelle et design avant-gardiste.",
  keywords: ["mode", "vêtements", "premium", "design", "qualité"],
  authors: [{ name: "Reboul Store" }],
  creator: "Reboul Store",
  metadataBase: new URL("https://reboul-store.com"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://reboul-store.com",
    title: "Reboul Store - Mode Premium",
    description: "Collection exclusive de vêtements premium",
    siteName: "Reboul Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reboul Store",
    description: "Mode premium et design avant-gardiste",
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
    google: "google-site-verification=your-google-verification-code",
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
      </head>
      <body
        className={`min-h-screen bg-background font-sans antialiased ${inter.className}`}
      >
        <ClientProviders>
          <ClientSideLayout>
            {children}
          </ClientSideLayout>
        </ClientProviders>
      </body>
    </html>
  );
}
