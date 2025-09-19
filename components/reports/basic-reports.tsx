"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, TrendingUp, Package, AlertTriangle } from "lucide-react"

const reports = [
  {
    id: 1,
    title: "Reporte de Stock Bajo",
    description: "Productos con inventario por debajo del mínimo establecido",
    icon: AlertTriangle,
    status: "Crítico",
    statusColor: "destructive" as const,
    items: 12,
    lastUpdate: "Hace 2 horas",
  },
  {
    id: 2,
    title: "Análisis de Movimientos",
    description: "Entradas y salidas de productos en el último mes",
    icon: TrendingUp,
    status: "Actualizado",
    statusColor: "default" as const,
    items: 245,
    lastUpdate: "Hace 1 hora",
  },
  {
    id: 3,
    title: "Inventario por Categorías",
    description: "Distribución de productos por categoría y valor total",
    icon: Package,
    status: "Disponible",
    statusColor: "secondary" as const,
    items: 8,
    lastUpdate: "Hace 30 min",
  },
]

export function BasicReports() {
  const handleDownload = (reportId: number, title: string) => {
    // Simular descarga de reporte
    console.log(`Descargando reporte: ${title}`)
    // Aquí iría la lógica real de descarga
  }

  const handleView = (reportId: number, title: string) => {
    // Simular visualización de reporte
    console.log(`Visualizando reporte: ${title}`)
    // Aquí iría la lógica para mostrar el reporte
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reports.map((report) => {
        const IconComponent = report.icon
        return (
          <Card key={report.id} className="bg-card border-border hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{report.title}</CardTitle>
                    <Badge variant={report.statusColor} className="mt-1">
                      {report.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{report.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Elementos:</span>
                <span className="font-medium text-foreground">{report.items}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Actualizado:</span>
                <span className="text-foreground">{report.lastUpdate}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent border-border text-foreground hover:bg-muted"
                  onClick={() => handleView(report.id, report.title)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent border-border text-foreground hover:bg-muted"
                  onClick={() => handleDownload(report.id, report.title)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
