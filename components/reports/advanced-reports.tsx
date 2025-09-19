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
import { exportToExcel, exportToPDF, generateSummaryReport, type ExportFilters } from "@/lib/export-utils"
import type { InventarioActivoOut } from "@/api/types/inventario"

export function AdvancedReports() {
  const [activosData, setActivosData] = useState<InventarioActivoOut[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel')
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Estados para filtros
  const [filters, setFilters] = useState<ExportFilters>({
    tipoActivo: 'all',
    proceso: 'all',
    criticidad: 'all',
    confidencialidad: 'all',
    disponibilidad: 'all',
    limit: undefined,
    offset: undefined
  })

  const [includeFilters, setIncludeFilters] = useState({
    tipoActivo: false,
    proceso: false,
    criticidad: false,
    confidencialidad: false,
    disponibilidad: false,
    limit: false
  })

  // Cargar datos del inventario
  const loadInventoryData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Cargando datos para reportes...')
      const activosData = await getInventarioActivos({ limit: 1000 })
      setActivosData(activosData)
      console.log('✅ Datos cargados:', activosData.length, 'activos')
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

  // Obtener tipos únicos de activos
  const uniqueTypes = [...new Set(activosData.map(item => item.TIPO_DE_ACTIVO).filter(Boolean))]
  
  // Obtener procesos únicos
  const uniqueProcesses = [...new Set(activosData.map(item => item.PROCESO).filter(Boolean))]

  // Preparar filtros para exportación
  const prepareFilters = (): ExportFilters => {
    const exportFilters: ExportFilters = {}

    if (includeFilters.tipoActivo && filters.tipoActivo !== 'all') {
      exportFilters.tipoActivo = filters.tipoActivo
    }

    if (includeFilters.proceso && filters.proceso !== 'all') {
      exportFilters.proceso = filters.proceso
    }

    if (includeFilters.criticidad && filters.criticidad !== 'all') {
      exportFilters.criticidad = filters.criticidad
    }

    if (includeFilters.confidencialidad && filters.confidencialidad !== 'all') {
      exportFilters.confidencialidad = filters.confidencialidad
    }

    if (includeFilters.disponibilidad && filters.disponibilidad !== 'all') {
      exportFilters.disponibilidad = filters.disponibilidad
    }

    if (includeFilters.limit && filters.limit) {
      exportFilters.limit = filters.limit
      exportFilters.offset = filters.offset || 0
    }

    return exportFilters
  }

  // Manejar exportación
  const handleExport = async () => {
    if (activosData.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos de activos para exportar",
        variant: "destructive"
      })
      return
    }

    setIsExporting(true)

    try {
      const exportFilters = prepareFilters()
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `activos_${timestamp}.${exportType === 'excel' ? 'xlsx' : 'pdf'}`

      let result
      if (exportType === 'excel') {
        result = exportToExcel(activosData, {
          filename,
          title: 'Reporte de Activos de Información - Sistema USB',
          filters: exportFilters
        })
      } else {
        result = exportToPDF(activosData, {
          filename,
          title: 'Reporte de Activos de Información - Sistema USB',
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
    if (activosData.length === 0) return

    const summary = generateSummaryReport(activosData)
    console.log('📊 Resumen de activos:', summary)
    
    toast({
      title: "Reporte de resumen generado",
      description: `Total: ${summary.totalItems} activos, Criticidad alta: ${summary.criticalItems}`,
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
                <p className="text-sm text-muted-foreground">Total Activos</p>
                <p className="text-2xl font-bold">{activosData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Criticidad Alta</p>
                <p className="text-2xl font-bold">
                  {activosData.filter(item => 
                    item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes('alta') ||
                    item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes('crítica')
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alta Confidencialidad</p>
                <p className="text-2xl font-bold">
                  {activosData.filter(item => 
                    item.CONFIDENCIALIDAD?.toLowerCase().includes('alta') ||
                    item.CONFIDENCIALIDAD?.toLowerCase().includes('confidencial')
                  ).length}
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
                <p className="text-sm text-muted-foreground">Tipos de Activos</p>
                <p className="text-2xl font-bold">{uniqueTypes.length}</p>
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

            {/* Filtro por tipo de activo */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="type-filter"
                checked={includeFilters.tipoActivo}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, tipoActivo: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="type-filter">Filtrar por tipo de activo</Label>
                <Select 
                  value={filters.tipoActivo} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, tipoActivo: value }))}
                  disabled={!includeFilters.tipoActivo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {uniqueTypes.map(type => type && (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro por proceso */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="process-filter"
                checked={includeFilters.proceso}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, proceso: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="process-filter">Filtrar por proceso</Label>
                <Select 
                  value={filters.proceso} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, proceso: value }))}
                  disabled={!includeFilters.proceso}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proceso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los procesos</SelectItem>
                    {uniqueProcesses.map(process => process && (
                      <SelectItem key={process} value={process}>
                        {process}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro por criticidad */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="criticality-filter"
                checked={includeFilters.criticidad}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, criticidad: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="criticality-filter">Filtrar por criticidad</Label>
                <Select 
                  value={filters.criticidad} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, criticidad: value }))}
                  disabled={!includeFilters.criticidad}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar criticidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las criticidades</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro por confidencialidad */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="confidentiality-filter"
                checked={includeFilters.confidencialidad}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, confidencialidad: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="confidentiality-filter">Filtrar por confidencialidad</Label>
                <Select 
                  value={filters.confidencialidad} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, confidencialidad: value }))}
                  disabled={!includeFilters.confidencialidad}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar confidencialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                    <SelectItem value="pública">Pública</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro por disponibilidad */}
            <div className="flex items-center space-x-4">
              <Checkbox
                id="availability-filter"
                checked={includeFilters.disponibilidad}
                onCheckedChange={(checked) => 
                  setIncludeFilters(prev => ({ ...prev, disponibilidad: !!checked }))
                }
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="availability-filter">Filtrar por disponibilidad</Label>
                <Select 
                  value={filters.disponibilidad} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, disponibilidad: value }))}
                  disabled={!includeFilters.disponibilidad}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar disponibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
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
          {(includeFilters.tipoActivo || includeFilters.proceso || includeFilters.criticidad || includeFilters.confidencialidad || includeFilters.disponibilidad || includeFilters.limit) && (
            <div className="space-y-2">
              <Label>Filtros activos:</Label>
              <div className="flex flex-wrap gap-2">
                {includeFilters.tipoActivo && filters.tipoActivo !== 'all' && (
                  <Badge variant="secondary">Tipo: {filters.tipoActivo}</Badge>
                )}
                {includeFilters.proceso && filters.proceso !== 'all' && (
                  <Badge variant="secondary">Proceso: {filters.proceso}</Badge>
                )}
                {includeFilters.criticidad && filters.criticidad !== 'all' && (
                  <Badge variant="secondary">Criticidad: {filters.criticidad}</Badge>
                )}
                {includeFilters.confidencialidad && filters.confidencialidad !== 'all' && (
                  <Badge variant="secondary">Confidencialidad: {filters.confidencialidad}</Badge>
                )}
                {includeFilters.disponibilidad && filters.disponibilidad !== 'all' && (
                  <Badge variant="secondary">Disponibilidad: {filters.disponibilidad}</Badge>
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
              disabled={activosData.length === 0}
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