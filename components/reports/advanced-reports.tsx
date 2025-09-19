"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getInventarioActivos } from "@/api"
import { mapApiActivoToInventoryItem } from "@/lib/api-mapping"
import { exportToExcel, exportToPDF, generateSummaryReport, type ExportFilters } from "@/lib/export-utils"
import type { InventoryItem } from "@/lib/inventory-data"

export function AdvancedReports() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel')
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Estados para filtros
  const [filters, setFilters] = useState<ExportFilters>({
    category: 'all',
    status: 'all',
    stockRange: { min: 0, max: 1000 },
    limit: undefined,
    offset: undefined
  })

  const [includeFilters, setIncludeFilters] = useState({
    category: false,
    status: false,
    stockRange: false,
    limit: false
  })

  // Cargar datos del inventario
  const loadInventoryData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Cargando datos para reportes...')
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

  // Obtener categorías únicas
  const uniqueCategories = [...new Set(inventoryData.map(item => item.category))]

  // Preparar filtros para exportación
  const prepareFilters = (): ExportFilters => {
    const exportFilters: ExportFilters = {}

    if (includeFilters.category && filters.category !== 'all') {
      exportFilters.category = filters.category
    }

    if (includeFilters.status && filters.status !== 'all') {
      exportFilters.status = filters.status as any
    }

    if (includeFilters.stockRange) {
      exportFilters.stockRange = filters.stockRange
    }

    if (includeFilters.limit && filters.limit) {
      exportFilters.limit = filters.limit
      exportFilters.offset = filters.offset || 0
    }

    return exportFilters
  }

  // Manejar exportación
  const handleExport = async () => {
    if (inventoryData.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos de inventario para exportar",
        variant: "destructive"
      })
      return
    }

    setIsExporting(true)

    try {
      const exportFilters = prepareFilters()
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `inventario_${timestamp}.${exportType === 'excel' ? 'xlsx' : 'pdf'}`

      let result
      if (exportType === 'excel') {
        result = exportToExcel(inventoryData, {
          filename,
          title: 'Reporte de Inventario - Sistema USB',
          filters: exportFilters
        })
      } else {
        result = exportToPDF(inventoryData, {
          filename,
          title: 'Reporte de Inventario - Sistema USB',
          filters: exportFilters
        })
      }

      toast({
        title: "Exportación exitosa",
        description: `${result.message} (${result.recordCount} registros)`,
      })

    } catch (error) {
      console.error('Error al exportar:', error)
      toast({
        title: "Error en la exportación",
        description: "No se pudo generar el reporte. Intenta nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Generar reporte de resumen
  const handleSummaryReport = () => {
    if (inventoryData.length === 0) return

    const summary = generateSummaryReport(inventoryData)
    console.log('📊 Resumen del inventario:', summary)
    
    toast({
      title: "Reporte de resumen generado",
      description: `Total: ${summary.totalItems} productos, Valor: $${summary.totalValue.toLocaleString()}`,
    })

    // Aquí podrías abrir un modal con el resumen detallado
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Cargando datos del inventario...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold">{inventoryData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">En Stock</p>
                <p className="text-2xl font-bold">
                  {inventoryData.filter(item => item.status === 'in-stock').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Bajo</p>
                <p className="text-2xl font-bold">
                  {inventoryData.filter(item => item.status === 'low-stock').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Categorías</p>
                <p className="text-2xl font-bold">{uniqueCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuración de reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Configuración de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tipo de exportación */}
          <div className="space-y-2">
            <Label>Formato de exportación</Label>
            <Select value={exportType} onValueChange={(value: 'excel' | 'pdf') => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Excel (.xlsx)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    PDF (.pdf)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Filtros */}
          <div className="space-y-4">
            <h3 className="font-medium">Filtros de datos</h3>

            {/* Filtro por categoría */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="category-filter"
                checked={includeFilters.category}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, category: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="category-filter">Filtrar por categoría</Label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  disabled={!includeFilters.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="status-filter"
                checked={includeFilters.status}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, status: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="status-filter">Filtrar por estado</Label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  disabled={!includeFilters.status}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="in-stock">En Stock</SelectItem>
                    <SelectItem value="low-stock">Stock Bajo</SelectItem>
                    <SelectItem value="out-of-stock">Sin Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro por rango de stock */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="stock-filter"
                checked={includeFilters.stockRange}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, stockRange: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="stock-filter">Filtrar por cantidad en stock</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Mín"
                    value={filters.stockRange?.min || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      stockRange: { ...prev.stockRange!, min: Number(e.target.value) || 0 }
                    }))}
                    disabled={!includeFilters.stockRange}
                  />
                  <Input
                    type="number"
                    placeholder="Máx"
                    value={filters.stockRange?.max || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      stockRange: { ...prev.stockRange!, max: Number(e.target.value) || 1000 }
                    }))}
                    disabled={!includeFilters.stockRange}
                  />
                </div>
              </div>
            </div>

            {/* Filtro por límite de registros */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="limit-filter"
                checked={includeFilters.limit}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, limit: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="limit-filter">Limitar número de registros</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Desde"
                    value={filters.offset || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      offset: Number(e.target.value) || 0
                    }))}
                    disabled={!includeFilters.limit}
                  />
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    value={filters.limit || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      limit: Number(e.target.value) || undefined
                    }))}
                    disabled={!includeFilters.limit}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Filtros activos */}
          {(includeFilters.category || includeFilters.status || includeFilters.stockRange || includeFilters.limit) && (
            <div className="space-y-2">
              <Label>Filtros activos:</Label>
              <div className="flex flex-wrap gap-2">
                {includeFilters.category && filters.category !== 'all' && (
                  <Badge variant="secondary">Categoría: {filters.category}</Badge>
                )}
                {includeFilters.status && filters.status !== 'all' && (
                  <Badge variant="secondary">Estado: {filters.status}</Badge>
                )}
                {includeFilters.stockRange && (
                  <Badge variant="secondary">
                    Stock: {filters.stockRange?.min} - {filters.stockRange?.max}
                  </Badge>
                )}
                {includeFilters.limit && filters.limit && (
                  <Badge variant="secondary">
                    Registros: {filters.offset || 0} - {(filters.offset || 0) + filters.limit}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar {exportType === 'excel' ? 'Excel' : 'PDF'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleSummaryReport}
              disabled={inventoryData.length === 0}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Resumen Ejecutivo
            </Button>

            <Button 
              variant="outline" 
              onClick={loadInventoryData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Actualizar Datos"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}