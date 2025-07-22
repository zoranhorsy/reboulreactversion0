"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { PromoProvider } from "./contexts/PromoContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster />
        <AuthProvider>
            <PromoProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </PromoProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
