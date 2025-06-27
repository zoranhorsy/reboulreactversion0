"use client";

import { useState, useEffect } from "react";
import { ReboulNavbarSidebar } from "@/components/navbar/ReboulNavbarSidebar";

interface ClientSideLayoutProps {
  children: React.ReactNode;
}

export function ClientSideLayout({ children }: ClientSideLayoutProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pendant l'hydratation, on affiche un layout minimal
  if (!isClient) {
    return (
      <div className="min-h-screen">
        <main className="min-h-screen p-4">
          {children}
        </main>
      </div>
    );
  }

  // Une fois côté client, on affiche la sidebar complète
  return (
    <ReboulNavbarSidebar>
      {children}
    </ReboulNavbarSidebar>
  );
} 