"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, Trash2, Plus, RefreshCw, Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import type { InventoryItem } from "@/lib/inventory-data"
import { formatCurrency } from "@/lib/inventory-data"
import { getInventarioActivos } from "@/api/get-inventario"
import { mapApiActivoToInventoryItem } from "@/lib/api-mapping"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { testApiConnection, testBasicConnectivity } from "@/api/test-api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InventoryTableProps {
  onEdit: (item: InventoryItem) => void
  onAdd: () => void
  onDelete: (item: InventoryItem) => void
  refreshKey?: number // Nueva prop para forzar recarga
}

export function InventoryTable({ onEdit, onDelete, onAdd, refreshKey }: InventoryTableProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
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
      
      try {
        // Intentar cargar datos de la API
        const activosData = await getInventarioActivos({ 
          skip: skip, 
          limit: itemsPerPage 
        })
        
        console.log(`✅ Datos recibidos de API: ${activosData.length} items para la página ${currentPage}`)
        
        const mappedItems = activosData.map(mapApiActivoToInventoryItem)
        setItems(mappedItems)
        
        // Solo obtener el total en la primera carga o cuando sea necesario
        if (totalItems === 0) {
          try {
            console.log('🔍 Obteniendo total de items...')
            const allItems = await getInventarioActivos({ skip: 0, limit: 1000 })
            const total = allItems.length
            setTotalItems(total)
            console.log(`📈 Total de items: ${total}`)
          } catch (totalError) {
            console.warn('⚠️ Error al obtener total, usando estimación:', totalError)
            if (activosData.length === itemsPerPage) {
              setTotalItems(currentPage * itemsPerPage + 1)
            } else {
              setTotalItems((currentPage - 1) * itemsPerPage + activosData.length)
            }
          }
        }
      } catch (apiError) {
        console.warn('⚠️ API no disponible, usando datos de demostración:', apiError)
        
        // Usar datos mock como fallback
        const { mockInventoryData } = await import('@/lib/inventory-data')
        
        // Aplicar paginación a los datos mock
        const startIndex = skip
        const endIndex = skip + itemsPerPage
        const mockItems = mockInventoryData.slice(startIndex, endIndex)
        
        setItems(mockItems)
        setTotalItems(mockInventoryData.length)
        
        // Mostrar advertencia al usuario
        setError('⚠️ Usando datos de demostración - La API no está disponible en este momento')
        toast({
          title: "Modo Demostración",
          description: "La API no está disponible. Mostrando datos de ejemplo.",
          variant: "default",
        })
        
        console.log(`🎭 Usando datos mock: ${mockItems.length} items de ${mockInventoryData.length} totales`)
      }
    } catch (err) {
      console.error('❌ Error crítico al cargar inventario:', err)
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

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Cálculos para paginación
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

  const getStatusBadge = (status: InventoryItem["status"]) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">En Stock</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Stock Bajo</Badge>
      case "out-of-stock":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Sin Stock</Badge>
      default:
        return <Badge>Desconocido</Badge>
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Gestión de Inventario</CardTitle>
          <div className="flex items-center gap-2">
            <Button onClick={handleTestConnection} variant="outline" size="sm">
              🧪 Probar API
            </Button>
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
                  <TableHead className="text-muted-foreground">Producto</TableHead>
                  <TableHead className="text-muted-foreground">Categoría</TableHead>
                  <TableHead className="text-muted-foreground">Cantidad</TableHead>
                  <TableHead className="text-muted-foreground">Precio</TableHead>
                  <TableHead className="text-muted-foreground">Proveedor</TableHead>
                  <TableHead className="text-muted-foreground">Estado</TableHead>
                  <TableHead className="text-muted-foreground">Acciones</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="border-border">
                  <TableCell className="font-mono text-sm text-muted-foreground">{item.id}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.category}</TableCell>
                  <TableCell className="text-foreground">
                    <span className={item.quantity <= item.minStock ? "text-red-500 font-medium" : ""}>
                      {item.quantity}
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">(min: {item.minStock})</span>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.supplier}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
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
