"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import type { InventoryStats } from "@/lib/inventory-data"
import { useState, useCallback } from "react"
import { RefreshCw, Plus, Minus, PieChart as PieChartIcon } from "lucide-react"

interface CategoryChartProps {
  stats: InventoryStats
}

// Colores con transparencia como en el ejemplo
const CHART_COLORS = {
  red: '#ef4444',
  orange: '#f97316', 
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  lime: '#84cc16'
}

const COLORS = [
  CHART_COLORS.red,
  CHART_COLORS.orange,
  CHART_COLORS.yellow,
  CHART_COLORS.green,
  CHART_COLORS.blue,
  CHART_COLORS.purple,
  CHART_COLORS.cyan,
  CHART_COLORS.lime,
]

// Función para hacer colores transparentes
const transparentize = (color: string, alpha: number) => {
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Utilidades para generar datos aleatorios
const generateRandomData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min)
}

const generateRandomCategoryData = (originalData: any[]) => {
  return originalData.map(item => ({
    ...item,
    count: generateRandomData(1, 0, 100)[0]
  }))
}

export function CategoryChart({ stats }: CategoryChartProps) {
  // Obtener solo los 5 más importantes ordenados por cantidad
  const getTop5Categories = (categories: any[]) => {
    return categories
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const [chartData, setChartData] = useState(getTop5Categories(stats.categories))
  const [isRandomized, setIsRandomized] = useState(false)

  const randomizeData = useCallback(() => {
    const newData = generateRandomCategoryData(stats.categories)
    setChartData(getTop5Categories(newData))
    setIsRandomized(true)
  }, [stats.categories])

  const resetData = useCallback(() => {
    setChartData(getTop5Categories(stats.categories))
    setIsRandomized(false)
  }, [stats.categories])

  const addData = useCallback(() => {
    const newCategory = {
      name: `Categoría ${chartData.length + 1}`,
      count: generateRandomData(1, 0, 100)[0],
      value: generateRandomData(1, 0, 100)[0]
    }
    setChartData(prev => getTop5Categories([...prev, newCategory]))
  }, [chartData.length])

  const removeData = useCallback(() => {
    if (chartData.length > 1) {
      setChartData(prev => prev.slice(0, -1))
    }
  }, [chartData.length])

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
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribución por Categoría
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Top 5 categorías con mayor cantidad de productos
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
            <Button
              variant="outline"
              size="sm"
              onClick={addData}
              className="h-8 px-3"
            >
              <Plus className="h-3 w-3 mr-1" />
              Agregar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={removeData}
              disabled={chartData.length <= 1}
              className="h-8 px-3"
            >
              <Minus className="h-3 w-3 mr-1" />
              Quitar
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              innerRadius={30}
              fill="#8884d8"
              dataKey="count"
              stroke="#ffffff"
              strokeWidth={3}
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={transparentize(COLORS[index % COLORS.length], 0.5)}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
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
                const colorIndex = chartData.findIndex(item => item.name === name)
                const color = COLORS[colorIndex % COLORS.length]
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
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}