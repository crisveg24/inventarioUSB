import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingUp, AlertTriangle, XCircle } from "lucide-react"
import type { InventoryStats } from "@/lib/inventory-data"
import { formatCurrency } from "@/lib/inventory-data"

interface StatsCardsProps {
  stats: InventoryStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Items",
      value: stats.totalItems.toLocaleString(),
      description: "Productos en inventario",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Valor Total",
      value: formatCurrency(stats.totalValue),
      description: "Valor del inventario",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Stock Bajo",
      value: stats.lowStockItems.toString(),
      description: "Productos con stock bajo",
      icon: AlertTriangle,
      color: "text-yellow-500",
    },
    {
      title: "Sin Stock",
      value: stats.outOfStockItems.toString(),
      description: "Productos agotados",
      icon: XCircle,
      color: "text-red-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
