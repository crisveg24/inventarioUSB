import { AuthGuard } from "@/components/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TopItemsTable } from "@/components/dashboard/top-items-table"
import { getInventoryStats } from "@/lib/inventory-data"

export default function DashboardPage() {
  const stats = getInventoryStats()

  return (
    <AuthGuard>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard de Inventarios</h1>
              <p className="text-muted-foreground">Resumen general del sistema de inventarios</p>
            </div>
          </div>

          <StatsCards stats={stats} />

          <div className="grid gap-6 md:grid-cols-2">
            <InventoryChart stats={stats} />
            <CategoryChart stats={stats} />
          </div>

          <TopItemsTable stats={stats} />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
