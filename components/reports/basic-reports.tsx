"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Download, TrendingUp, Package, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getInventarioActivos } from "@/api"
import { mapApiActivoToInventoryItem } from "@/lib/api-mapping"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"
import { GeminiReportModal } from "./gemini-report-modal"
import type { InventoryItem } from "@/lib/inventory-data"

interface ReportData {
  id: string
  title: string
  description: string
  icon: any
  status: string
  statusColor: "default" | "destructive" | "secondary"
  items: number
  data: InventoryItem[]
  filterFn: (items: InventoryItem[]) => InventoryItem[]
}

export function BasicReports() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar datos del inventario
  const loadInventoryData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Cargando datos para reportes básicos...')
      const activosData = await getInventarioActivos({ limit: 1000 })
      const mappedItems = activosData.map(mapApiActivoToInventoryItem)
      setInventoryData(mappedItems)
      console.log('✅ Datos cargados:', mappedItems.length, 'items')
    } catch (error) {
      console.error('❌ Error al cargar datos:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al cargar datos: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInventoryData()
  }, [])

  // Configuración de reportes con datos reales
  const getReports = (data: InventoryItem[]): ReportData[] => [
    {
      id: "low-stock",
      title: "Reporte de Stock Bajo",
      description: "Productos con inventario por debajo del stock mínimo",
      icon: AlertTriangle,
      status: data.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length > 0 ? "Crítico" : "Normal",
      statusColor: data.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length > 0 ? "destructive" : "secondary",
      items: data.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock').length,
      data,
      filterFn: (items) => items.filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
    },
    {
      id: "by-category",
      title: "Inventario por Categorías",
      description: "Distribución de productos por categoría y valor total",
      icon: Package,
      status: "Disponible",
      statusColor: "default",
      items: [...new Set(data.map(item => item.category))].length,
      data,
      filterFn: (items) => items // Sin filtro, todos los items agrupados por categoría
    },
    {
      id: "high-value",
      title: "Productos de Alto Valor",
      description: "Productos con mayor valor unitario y total en inventario",
      icon: TrendingUp,
      status: "Actualizado",
      statusColor: "secondary",
      items: data.filter(item => item.price * item.quantity > 100000).length, // Productos con valor total > 100k
      data,
      filterFn: (items) => items.filter(item => item.price * item.quantity > 100000).sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
    },
  ]

  const handleDownload = async (report: ReportData, format: 'excel' | 'pdf') => {
    setIsExporting(`${report.id}-${format}`)
    
    try {
      const filteredData = report.filterFn(report.data)
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `${report.id}_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`

      let result
      if (format === 'excel') {
        result = exportToExcel(filteredData, {
          filename,
          title: report.title,
          filters: {}
        })
      } else {
        result = exportToPDF(filteredData, {
          filename,
          title: report.title,
          filters: {}
        })
      }

      toast({
        title: "Descarga exitosa",
        description: `${report.title} descargado como ${format.toUpperCase()}`,
      })

    } catch (error) {
      console.error('Error al descargar:', error)
      toast({
        title: "Error en la descarga",
        description: "No se pudo generar el reporte. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(null)
    }
  }

  const handleView = (report: ReportData) => {
    const filteredData = report.filterFn(report.data)
    console.log(`📊 Visualizando ${report.title}:`, filteredData)
    
    toast({
      title: "Vista previa",
      description: `${report.title}: ${filteredData.length} elementos encontrados`,
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando reportes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadInventoryData}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const reports = getReports(inventoryData)

  return (
    <div className="space-y-6">
      {/* Sección de IA */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Package className="h-5 w-5" />
            Reportes con Inteligencia Artificial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Genera reportes personalizados usando inteligencia artificial. Simplemente describe lo que necesitas 
            en lenguaje natural y la IA filtrará los productos según tus criterios.
          </p>
          
          <div className="flex items-center gap-4">
            <GeminiReportModal />
            
            <div className="text-xs text-muted-foreground">
              ✨ Consultas en lenguaje natural<br/>
              📊 Filtros inteligentes<br/>
              📄 Exportación automática
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reportes básicos */}
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
                <span className="text-xs text-muted-foreground">Hace 5 min</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleView(report)}
                  className="flex-1"
                  disabled={report.items === 0}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(report, 'excel')}
                  disabled={isExporting === `${report.id}-excel` || report.items === 0}
                >
                  {isExporting === `${report.id}-excel` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownload(report, 'pdf')}
                  disabled={isExporting === `${report.id}-pdf` || report.items === 0}
                >
                  {isExporting === `${report.id}-pdf` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Card de resumen */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Resumen General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total productos:</span>
              <span className="font-medium">{inventoryData.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">En stock:</span>
              <span className="font-medium text-green-600">
                {inventoryData.filter(item => item.status === 'in-stock').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Stock bajo:</span>
              <span className="font-medium text-yellow-600">
                {inventoryData.filter(item => item.status === 'low-stock').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sin stock:</span>
              <span className="font-medium text-red-600">
                {inventoryData.filter(item => item.status === 'out-of-stock').length}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={loadInventoryData} 
            variant="outline" 
            size="sm" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar Datos
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
          