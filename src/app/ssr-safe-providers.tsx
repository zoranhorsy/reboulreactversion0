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
            <SSRSafeCartProvider>
              {children}
              <Toaster />
            </SSRSafeCartProvider>
          </SSRSafeFavoritesProvider>
        </SSRSafeAuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
