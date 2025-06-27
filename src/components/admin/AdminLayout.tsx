"use client";

import { useState } from "react";
import { AdminNav } from "./AdminNav";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <span>☰</span>
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col h-full">
                <div className="flex h-12 items-center">
                  <h2 className="text-lg font-semibold">Administration</h2>
                </div>
                <AdminNav />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 flex items-center justify-end">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0">
        <div className="flex flex-col flex-grow gap-y-6 overflow-y-auto border-r px-6 py-8">
          <div className="flex h-12 items-center">
            <h2 className="text-lg font-semibold">Administration</h2>
          </div>
          <AdminNav />
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:pl-64">
        {/* Desktop header */}
        <div className="hidden lg:flex h-14 items-center gap-x-4 border-b px-8">
          <div className="flex-1 flex items-center justify-end">
            <UserNav />
          </div>
        </div>

        <div className="px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
