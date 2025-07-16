import { Metadata } from "next";
import { defaultViewport } from "@/components/ClientPageWrapper";
import nextDynamic from "next/dynamic";
import { ShoppingCart } from "lucide-react";

const AdminOrders = nextDynamic(() => import("@/components/admin/AdminOrders").then(mod => ({ default: mod.AdminOrders })), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false,
});

export const metadata: Metadata = {
  title: "Gestion des Commandes - Administration Reboul Store",
  description: "Interface d'administration pour la gestion des commandes",
  robots: "noindex, nofollow",
};

export const viewport = defaultViewport;
export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/5 text-primary">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
      </div>
      <AdminOrders />
    </div>
  );
} 