"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { InventoryChart } from "@/components/dashboard/inventory-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TopItemsTable } from "@/components/dashboard/top-items-table"
import { getInventarioActivos } from "@/api"
import { mapApiActivoToInventoryItem } from "@/lib/api-mapping"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { InventoryItem, InventoryStats } from "@/lib/inventory-data"

// Función para calcular estadísticas reales de los datos de la API
function calculateRealStats(items: InventoryItem[]): InventoryStats {
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const lowStockItems = items.filter(item => item.status === 'low-stock').length
  const outOfStockItems = items.filter(item => item.status === 'out-of-stock').length

  // Agrupar por categorías
  const categoryMap = new Map<string, { count: number; value: number }>()
  items.forEach(item => {
    const existing = categoryMap.get(item.category) || { count: 0, value: 0 }
    categoryMap.set(item.category, {
      count: existing.count + 1,
      value: existing.value + (item.price * item.quantity)
    })
  })

  const categories = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    value: data.value
  }))

  // Top items por valor
  const topItems = items
    .map(item => ({
      name: item.name,
      quantity: item.quantity,
      value: item.price * item.quantity
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Movimiento mensual simulado (podrías expandir esto con datos reales de fechas)
  const monthlyMovement = [
    { month: 'Ene', inbound: Math.floor(totalItems * 0.1), outbound: Math.floor(totalItems * 0.08) },
    { month: 'Feb', inbound: Math.floor(totalItems * 0.12), outbound: Math.floor(totalItems * 0.09) },
    { month: 'Mar', inbound: Math.floor(totalItems * 0.15), outbound: Math.floor(totalItems * 0.11) },
    { month: 'Abr', inbound: Math.floor(totalItems * 0.13), outbound: Math.floor(totalItems * 0.10) },
    { month: 'May', inbound: Math.floor(totalItems * 0.14), outbound: Math.floor(totalItems * 0.12) },
    { month: 'Jun', inbound: Math.floor(totalItems * 0.16), outbound: Math.floor(totalItems * 0.13) },
  ]

  return {
    totalItems,
    totalValue,
    lowStockItems,
    outOfStockItems,
    categories,
    monthlyMovement,
    topItems
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Cargando datos del dashboard...')
      
      // Obtener todos los datos para calcular estadísticas
      const activosData = await getInventarioActivos({ limit: 1000 }) // Obtener todos los items
      
      console.log('📊 Datos obtenidos:', activosData.length, 'items')
      
      // Mapear datos de la API al formato interno
      const mappedItems = activosData.map(mapApiActivoToInventoryItem)
      
      // Calcular estadísticas reales
      const realStats = calculateRealStats(mappedItems)
      
      setStats(realStats)
      console.log('✅ Dashboard cargado exitosamente')
      
    } catch (error) {
      console.error('❌ Error al cargar dashboard:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al cargar datos del dashboard: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard de Inventarios</h1>
                <p className="text-muted-foreground">Cargando datos del sistema...</p>
              </div>
            </div>

            {/* Loading skeletons */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>

            <Skeleton className="h-60" />
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard de Inventarios</h1>
                <p className="text-muted-foreground">Error al cargar los datos</p>
              </div>
              <Button onClick={loadDashboardData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>

            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  if (!stats) {
    return (
      <AuthGuard>
        <AppLayout>
          <div className="container mx-auto p-6 space-y-6">
            <Alert>
              <AlertDescription>No se pudieron cargar los datos del dashboard.</AlertDescription>
            </Alert>
          </div>
        </AppLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard de Inventarios</h1>
              <p className="text-muted-foreground">Resumen general del sistema de inventarios</p>
            </div>
            <Button onClick={loadDashboardData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          <StatsCards stats={stats} isLoading={isLoading} />

          <div className="grid gap-6 md:grid-cols-2">
            <div data-tour="inventory-chart">
              <InventoryChart stats={stats} />
            </div>
            <div data-tour="category-chart">
              <CategoryChart stats={stats} />
            </div>
          </div>

          <div data-tour="top-items">
            <TopItemsTable stats={stats} />
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
