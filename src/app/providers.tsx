"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { CartProvider } from "@/app/contexts/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
            <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
