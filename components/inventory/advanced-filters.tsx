"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import type { InventoryItem } from "@/lib/inventory-data"

export interface FilterOptions {
  searchTerm: string
  category: string
  status: string
  supplier: string
  minQuantity: number | null
  maxQuantity: number | null
  minPrice: number | null
  maxPrice: number | null
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  onClearFilters: () => void
  items: InventoryItem[]
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  items 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Obtener opciones únicas para los filtros
  const categories = Array.from(new Set(items.map(item => item.category))).sort()
  const suppliers = Array.from(new Set(items.map(item => item.supplier))).sort()
  const statuses = ["in-stock", "low-stock", "out-of-stock"]

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | null) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.category) count++
    if (filters.status) count++
    if (filters.supplier) count++
    if (filters.minQuantity !== null) count++
    if (filters.maxQuantity !== null) count++
    if (filters.minPrice !== null) count++
    if (filters.maxPrice !== null) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card className="border-border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between p-4 h-auto"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filtros Avanzados</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            {/* Búsqueda general */}
            <div className="space-y-2">
              <Label htmlFor="search">Búsqueda general</Label>
              <Input
                id="search"
                placeholder="Buscar en nombre, categoría, proveedor..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              />
            </div>

            {/* Filtros por categoría y estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="in-stock">En Stock</SelectItem>
                    <SelectItem value="low-stock">Stock Bajo</SelectItem>
                    <SelectItem value="out-of-stock">Sin Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtro por proveedor */}
            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor/Departamento</Label>
              <Select value={filters.supplier} onValueChange={(value) => handleFilterChange("supplier", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los proveedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los proveedores</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtros por cantidad */}
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minQuantity" className="text-xs text-muted-foreground">Mínima</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    placeholder="0"
                    value={filters.minQuantity || ""}
                    onChange={(e) => handleFilterChange("minQuantity", e.target.value ? Number(e.target.value) : null)}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxQuantity" className="text-xs text-muted-foreground">Máxima</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    placeholder="∞"
                    value={filters.maxQuantity || ""}
                    onChange={(e) => handleFilterChange("maxQuantity", e.target.value ? Number(e.target.value) : null)}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Filtros por precio */}
            <div className="space-y-2">
              <Label>Precio (COP)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="minPrice" className="text-xs text-muted-foreground">Mínimo</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="0"
                    value={filters.minPrice || ""}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value ? Number(e.target.value) : null)}
                    min="0"
                    step="1000"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">Máximo</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="∞"
                    value={filters.maxPrice || ""}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value ? Number(e.target.value) : null)}
                    min="0"
                    step="1000"
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClearFilters}
                disabled={activeFiltersCount === 0}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {activeFiltersCount > 0 && `${activeFiltersCount} filtro${activeFiltersCount > 1 ? 's' : ''} activo${activeFiltersCount > 1 ? 's' : ''}`}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
