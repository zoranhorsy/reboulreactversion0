import { WebVitalsAnalyzer } from "@/components/performance/WebVitalsAnalyzer";
import AdminLayout from "@/app/admin/layout";

export const metadata = {
  title: "Analyse des performances | Reboul Admin",
  description:
    "Tableau de bord de suivi des Web Vitals et performances du site Reboul",
};

export const dynamic = "force-dynamic";

export default function PerformancePage() {
  return (
    <AdminLayout>
      <div className="space-y-6 py-6 px-4 md:px-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <p className="text-muted-foreground">
            Analysez les métriques de performance Web Vitals pour optimiser
            l&apos;expérience utilisateur
          </p>
        </div>

        <div className="my-8">
          <WebVitalsAnalyzer />
        </div>
      </div>
    </AdminLayout>
  );
}
