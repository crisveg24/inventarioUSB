"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import type { InventoryStats } from "@/lib/inventory-data"
import { useState, useCallback } from "react"
import { RefreshCw, BarChart3 } from "lucide-react"

interface InventoryChartProps {
  stats: InventoryStats
}

// Utilidades para generar datos aleatorios
const generateRandomData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

const generateRandomMovementData = (originalData: any[]) => {
  return originalData.map(item => ({
    ...item,
    inbound: generateRandomData(1, 0, 100)[0],
    outbound: generateRandomData(1, 0, 100)[0]
  }))
}

export function InventoryChart({ stats }: InventoryChartProps) {
  const [chartData, setChartData] = useState(stats.monthlyMovement)
  const [isRandomized, setIsRandomized] = useState(false)

  const randomizeData = useCallback(() => {
    const newData = generateRandomMovementData(stats.monthlyMovement)
    setChartData(newData)
    setIsRandomized(true)
  }, [stats.monthlyMovement])

  const resetData = useCallback(() => {
    setChartData(stats.monthlyMovement)
    setIsRandomized(false)
  }, [stats.monthlyMovement])

  // Configuración mejorada del chart
  const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'hsl(var(--border))',
          opacity: 0.3
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  }

  // Datasets con mejor estilización
  const datasets = [
    {
      label: 'Entradas',
      dataKey: 'inbound',
      color: '#ef4444', // red-500
      backgroundColor: 'rgba(239, 68, 68, 0.5)',
      borderColor: '#ef4444',
      borderWidth: 2,
      borderRadius: Number.MAX_VALUE, // Fully rounded
      borderSkipped: false
    },
    {
      label: 'Salidas', 
      dataKey: 'outbound',
      color: '#3b82f6', // blue-500
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8, // Small radius
      borderSkipped: false
    }
  ]

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Movimiento Mensual
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Entradas y salidas de inventario por mes
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={randomizeData}
              className="h-8 px-3"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Randomizar
            </Button>
            {isRandomized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetData}
                className="h-8 px-3"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="20%"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              opacity={0.3} 
            />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                color: "#000000",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
                fontSize: "14px",
                padding: "12px",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)"
              }}
              formatter={(value: any, name: string) => {
                const color = name === 'Entradas' ? '#ef4444' : '#3b82f6'
                return [
                  <span style={{ color: color, fontWeight: '600' }}>
                    {value} productos
                  </span>,
                  <span style={{ color: color, fontWeight: '500' }}>
                    {name}
                  </span>
                ]
              }}
              labelStyle={{
                color: '#000000',
                fontWeight: '700',
                backgroundColor: 'transparent',
                fontSize: '15px'
              }}
              itemStyle={{
                backgroundColor: 'transparent'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px'
              }}
            />
            {datasets.map((dataset, index) => (
              <Bar 
                key={dataset.dataKey}
                dataKey={dataset.dataKey} 
                fill={dataset.color}
                name={dataset.label}
                radius={[dataset.borderRadius, dataset.borderRadius, 0, 0]}
                stroke={dataset.borderColor}
                strokeWidth={dataset.borderWidth}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
