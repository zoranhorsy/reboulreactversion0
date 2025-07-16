"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import {
  SSRSafeAuthProvider,
  SSRSafeFavoritesProvider,
  SSRSafeCartProvider,
} from "@/app/contexts/SSRSafeProviders";
import { PromoProvider } from "@/app/contexts/PromoContext";

export function SSRSafeProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SSRSafeAuthProvider>
          <SSRSafeFavoritesProvider>
            <PromoProvider>
              <SSRSafeCartProvider>
                {children}
                <Toaster />
              </SSRSafeCartProvider>
            </PromoProvider>
          </SSRSafeFavoritesProvider>
        </SSRSafeAuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
