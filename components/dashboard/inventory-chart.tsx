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
          <BarChart data={stats.monthlyMovement}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="inbound" fill="hsl(var(--chart-2))" name="Entradas" radius={[2, 2, 0, 0]} />
            <Bar dataKey="outbound" fill="hsl(var(--chart-1))" name="Salidas" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
