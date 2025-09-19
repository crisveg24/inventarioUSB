"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Plus, RefreshCw, Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { getInventarioActivos } from "@/api/get-inventario"
import { InventarioActivoOut } from "@/api/types/inventario"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { testApiConnection, testBasicConnectivity } from "@/api/test-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InventoryTableProps {
  onEdit: (item: InventarioActivoOut) => void
  onAdd: () => void
  onDelete: (item: InventarioActivoOut) => void
  refreshKey?: number // Nueva prop para forzar recarga
}

export function InventoryTable({ onEdit, onDelete, onAdd, refreshKey }: InventoryTableProps) {
  const [items, setItems] = useState<InventarioActivoOut[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  
  const { toast } = useToast()

  const loadInventoryData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log(`🔄 Cargando página ${currentPage}, items por página: ${itemsPerPage}`)
      
      const skip = (currentPage - 1) * itemsPerPage
      console.log(`📊 Parámetros: skip=${skip}, limit=${itemsPerPage}`)
      
      // Cargar solo los datos de la página actual
      const activosData = await getInventarioActivos({ 
        skip: skip, 
        limit: itemsPerPage 
      })
      
      console.log(`✅ Datos recibidos: ${activosData.length} items para la página ${currentPage}`)
      
      // Usar datos directamente sin mapeo
      setItems(activosData)
      
      // Solo obtener el total en la primera carga o cuando sea necesario
      // En una API real, esto debería venir en la respuesta de paginación
      if (totalItems === 0) {
        try {
          console.log('🔍 Obteniendo total de items...')
          // Hacer una consulta para obtener solo el primer elemento y estimar el total
          // o usar un endpoint específico para contar
          const allItems = await getInventarioActivos({ skip: 0, limit: 1000 })
          const total = allItems.length
          setTotalItems(total)
          console.log(`📈 Total de items: ${total}`)
        } catch (totalError) {
          console.warn('⚠️ Error al obtener total, usando estimación:', totalError)
          // Estimar el total basado en si la página actual está llena
          if (activosData.length === itemsPerPage) {
            // Si la página actual está llena, probablemente hay más páginas
            setTotalItems(currentPage * itemsPerPage + 1)
          } else {
            // Si la página actual no está llena, es la última página
            setTotalItems((currentPage - 1) * itemsPerPage + activosData.length)
          }
        }
      }
    } catch (err) {
      console.error('❌ Error al cargar inventario:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos del inventario'
      setError(errorMessage)
      toast({
        title: "Error al cargar datos",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInventoryData()
  }, [refreshKey, currentPage, itemsPerPage]) // Recargar cuando refreshKey, currentPage o itemsPerPage cambien

  const handleTestConnection = async () => {
    console.log('🧪 Iniciando prueba de conexión...');
    
    // Primero probar conectividad básica
    const basicTest = await testBasicConnectivity();
    console.log('Resultado prueba básica:', basicTest);
    
    // Luego probar la API completa
    const fullTest = await testApiConnection();
    console.log('Resultado prueba completa:', fullTest);
    
    if (fullTest.success) {
      toast({
        title: "✅ Conexión exitosa",
        description: `API funcionando correctamente. ${fullTest.count} activos recibidos en ${fullTest.responseTime}ms`,
      })
    } else {
      toast({
        title: "❌ Error de conexión",
        description: fullTest.error || 'Error desconocido',
        variant: "destructive",
      })
    }
  }

  const filteredItems = items.filter((item) =>
    (item.NOMBRE_DEL_ACTIVO?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.TIPO_DE_ACTIVO?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.PROCESO?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.DUEÑO_DE_ACTIVO?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.DESCRIPCION?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.CONFIDENCIALIDAD?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.FORMATO?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (item.MEDIO_DE_CONSERVACIÓN?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  )  // Cálculos para paginación
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadInventoryData()
    setIsRefreshing(false)
  }

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage)
    // loadInventoryData se ejecutará automáticamente por el useEffect cuando currentPage cambie
  }

  const handleItemsPerPageChange = async (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    setTotalItems(0) // Reset total para que se recalcule
    // loadInventoryData se ejecutará automáticamente por el useEffect cuando itemsPerPage y currentPage cambien
  }

  const getStatusBadge = (criticidad: string | null | undefined) => {
    if (!criticidad) {
      return <Badge variant="secondary">Sin clasificar</Badge>
    }

    const crit = criticidad.toLowerCase()
    if (crit.includes("alto") || crit.includes("crítico")) {
      return <Badge variant="destructive">Crítico</Badge>
    } else if (crit.includes("medio")) {
      return <Badge variant="default">Medio</Badge>
    } else if (crit.includes("bajo")) {
      return <Badge variant="secondary">Bajo</Badge>
    } else {
      return <Badge variant="outline">{criticidad}</Badge>
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Gestión de Inventario</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refrescar
            </Button>
            <Button onClick={onAdd} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Cargando datos del inventario...</p>
          </div>
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">ID</TableHead>
                  <TableHead className="text-muted-foreground">Nombre del Activo</TableHead>
                  <TableHead className="text-muted-foreground">Tipo de Activo</TableHead>
                  <TableHead className="text-muted-foreground">Proceso</TableHead>
                  <TableHead className="text-muted-foreground">Dueño del Activo</TableHead>
                  <TableHead className="text-muted-foreground">Criticidad</TableHead>
                  <TableHead className="text-muted-foreground">Confidencialidad</TableHead>
                  <TableHead className="text-muted-foreground">Disponibilidad</TableHead>
                  <TableHead className="text-muted-foreground">Integridad</TableHead>
                  <TableHead className="text-muted-foreground">Formato</TableHead>
                  <TableHead className="text-muted-foreground">Medio Conservación</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-mono text-sm text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    <div className="max-w-[200px] truncate" title={item.NOMBRE_DEL_ACTIVO || 'Sin nombre'}>
                      {item.NOMBRE_DEL_ACTIVO || 'Sin nombre'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[120px] truncate" title={item.TIPO_DE_ACTIVO || 'Sin tipo'}>
                      {item.TIPO_DE_ACTIVO || 'Sin tipo'}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">
                    <div className="max-w-[150px] truncate" title={item.PROCESO || 'Sin proceso'}>
                      {item.PROCESO || 'Sin proceso'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[150px] truncate" title={item.DUEÑO_DE_ACTIVO || 'Sin dueño'}>
                      {item.DUEÑO_DE_ACTIVO || 'Sin dueño'}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(item.CRITICIDAD_TOTAL_DEL_ACTIVO)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[100px] truncate" title={item.CONFIDENCIALIDAD || 'Sin datos'}>
                      {item.CONFIDENCIALIDAD || 'Sin datos'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[100px] truncate" title={item.DISPONIBILIDAD || 'Sin datos'}>
                      {item.DISPONIBILIDAD || 'Sin datos'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[100px] truncate" title={item.INTEGRIDAD || 'Sin datos'}>
                      {item.INTEGRIDAD || 'Sin datos'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[100px] truncate" title={item.FORMATO || 'Sin formato'}>
                      {item.FORMATO || 'Sin formato'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="max-w-[120px] truncate" title={item.MEDIO_DE_CONSERVACIÓN || 'Sin datos'}>
                      {item.MEDIO_DE_CONSERVACIÓN || 'Sin datos'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}

        {!isLoading && filteredItems.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron productos que coincidan con la búsqueda.</p>
          </div>
        )}

        {!isLoading && totalItems > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Mostrando {startItem} a {endItem} de {totalItems} activos
              </span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(Number(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">por página</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
