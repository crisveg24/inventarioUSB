"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { InventoryStats } from "@/lib/inventory-data"

interface CategoryChartProps {
  stats: InventoryStats
}

const COLORS = [
  "#3b82f6", // Azul
  "#10b981", // Verde
  "#f59e0b", // Amarillo
  "#ef4444", // Rojo
  "#8b5cf6", // Púrpura
  "#06b6d4", // Cian
  "#84cc16", // Lima
  "#f97316", // Naranja
]

export function CategoryChart({ stats }: CategoryChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Distribución por Tipo de Activo</CardTitle>
        <CardDescription className="text-muted-foreground">Cantidad de activos por tipo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats.categories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              innerRadius={40}
              fill="#8884d8"
              dataKey="count"
              stroke="#ffffff"
              strokeWidth={2}
            >
              {stats.categories.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
              formatter={(value: any, name: string) => [
                `${value} activos`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
