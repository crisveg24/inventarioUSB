"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface InventoryChartProps {
  stats: any
}

export function InventoryChart({ stats }: InventoryChartProps) {
  // Generar datos de distribución por proceso basado en los activos
  const processData = stats.categories?.map((category: any, index: number) => ({
    proceso: category.name,
    activos: category.count,
    color: `hsl(${index * 45}, 70%, 50%)`
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
                borderRadius: "6px"
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: any) => [`${value} activos`, 'Cantidad']}
            />
            <Bar 
              dataKey="activos" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
