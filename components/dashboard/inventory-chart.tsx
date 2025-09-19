"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import type { InventoryStats } from "@/lib/inventory-data"

interface InventoryChartProps {
  stats: InventoryStats
}

export function InventoryChart({ stats }: InventoryChartProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Movimiento Mensual</CardTitle>
        <CardDescription className="text-muted-foreground">Entradas y salidas de inventario por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.monthlyMovement} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }}
              formatter={(value: any, name: string) => [
                `${value} productos`,
                name
              ]}
            />
            <Bar 
              dataKey="inbound" 
              fill="#10b981" 
              name="Entradas" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="outbound" 
              fill="#3b82f6" 
              name="Salidas" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
