"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface InventoryChartProps {
  stats: any
}

export function InventoryChart({ stats }: InventoryChartProps) {
  // Colores vibrantes para cada barra
  const colors = [
    "#3b82f6", // Azul
    "#10b981", // Verde
    "#f59e0b", // Amarillo
    "#ef4444", // Rojo
    "#8b5cf6", // Púrpura
    "#06b6d4", // Cian
    "#84cc16", // Lima
    "#f97316", // Naranja
    "#ec4899", // Rosa
    "#6366f1", // Índigo
  ]

  // Generar datos de distribución por proceso basado en los activos
  const processData = stats.categories?.map((category: any, index: number) => ({
    proceso: category.name,
    activos: category.count,
    fill: colors[index % colors.length] // Asignar color específico
  })) || []

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Distribución por Proceso</CardTitle>
        <CardDescription className="text-muted-foreground">Cantidad de activos agrupados por proceso</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={processData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="proceso" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "500" }}
              formatter={(value: any, name: string, props: any) => [
                `${value} activos`, 
                'Cantidad'
              ]}
              labelFormatter={(label) => `Proceso: ${label}`}
            />
            <Bar 
              dataKey="activos" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
