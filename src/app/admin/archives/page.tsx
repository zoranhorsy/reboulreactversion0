import { Metadata } from "next";
import { defaultViewport } from "@/components/ClientPageWrapper";
import nextDynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Archive } from "lucide-react";

const ArchiveManager = nextDynamic(() => import("@/components/admin/ArchiveManager").then(mod => ({ default: mod.ArchiveManager })), {
  loading: () => (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
  ssr: false,
});

export const metadata: Metadata = {
  title: "Gestion des Archives - Administration Reboul Store",
  description: "Interface d'administration pour la gestion des archives",
  robots: "noindex, nofollow",
};

export const viewport = defaultViewport;
export const dynamic = "force-dynamic";

export default function AdminArchivesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/5 text-primary">
          <Archive className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Gestion des Archives</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gestion des archives</CardTitle>
          <CardDescription>
            Gérez les photos d&apos;archives de votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArchiveManager />
        </CardContent>
      </Card>
    </div>
  );
} 