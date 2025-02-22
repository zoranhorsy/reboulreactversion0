import { DashboardStats } from "@/components/admin/DashboardStats"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Tableau de Bord</h1>
      <DashboardStats />
    </div>
  )
} 