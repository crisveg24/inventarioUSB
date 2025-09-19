import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Shield, AlertTriangle, Eye } from "lucide-react"

interface StatsCardsProps {
  stats: any
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Activos",
      value: stats.totalItems?.toLocaleString() || "0",
      description: "Activos en el inventario",
      icon: Package,
      color: "text-blue-500",
    },
    {
      title: "Criticidad Alta",
      value: stats.criticalAssets?.toString() || "0",
      description: "Activos de alta criticidad",
      icon: AlertTriangle,
      color: "text-red-500",
    },
    {
      title: "Baja Disponibilidad",
      value: stats.lowAvailabilityAssets?.toString() || "0",
      description: "Activos con baja disponibilidad",
      icon: AlertTriangle,
      color: "text-yellow-500",
    },
    {
      title: "Alta Confidencialidad",
      value: stats.highConfidentialityAssets?.toString() || "0",
      description: "Activos confidenciales",
      icon: Shield,
      color: "text-green-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="border-border bg-card hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
            <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${
              card.color.includes('blue') ? 'from-blue-400 to-blue-600' :
              card.color.includes('green') ? 'from-green-400 to-green-600' :
              card.color.includes('yellow') ? 'from-yellow-400 to-yellow-600' :
              'from-red-400 to-red-600'
            } flex items-center justify-center shadow-lg`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold text-foreground ${isLoading ? 'animate-pulse' : ''}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
