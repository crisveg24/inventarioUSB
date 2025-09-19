"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { createInventarioActivoValidated, updateInventarioActivoValidated } from "@/api"
import type { InventoryItem } from "@/lib/inventory-data"

interface InventoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void // Cambiado para solo notificar que se guardó
  editingItem?: InventoryItem | null
}

export function InventoryForm({ isOpen, onClose, onSave, editingItem }: InventoryFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    quantity: 0,
    minStock: 0,
    price: 0,
    supplier: "",
  })

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem)
    } else {
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        minStock: 0,
        price: 0,
        supplier: "",
      })
    }
  }, [editingItem, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mapear los datos del formulario al formato de la API
      const apiData = {
        NOMBRE_DEL_ACTIVO: formData.name,
        DESCRIPCION: `Producto: ${formData.name}`,
        TIPO_DE_ACTIVO: formData.category,
        MEDIO_DE_CONSERVACIÓN: 'Digital',
        FORMATO: 'Electrónico',
        IDIOMA: 'Español',
        PROCESO: 'Gestión de Inventario',
        DUEÑO_DE_ACTIVO: formData.supplier,
        TIPO_DE_DATOS_PERSONALES: 'No aplica',
        FINALIDAD_DE_LA_RECOLECCIÓN: 'Control de inventario',
        CONFIDENCIALIDAD: 'Media',
        INTEGRIDAD: 'Alta',
        DISPONIBILIDAD: formData.quantity && formData.quantity > (formData.minStock || 0) ? 'Alta' : 
                       formData.quantity && formData.quantity > 0 ? 'Media' : 'Baja',
        CRITICIDAD_TOTAL_DEL_ACTIVO: formData.quantity && formData.quantity <= 5 ? 'Alta' :
                                    formData.quantity && formData.quantity <= 15 ? 'Media' : 'Baja',
        INFORMACIÓN_PUBLICADA_O_DISPONIBLE: 'No',
        LUGAR_DE_CONSULTA: 'Sistema de inventario',
      }

      if (editingItem) {
        // Actualizar item existente
        const itemId = Number.parseInt(editingItem.id) || 0
        await updateInventarioActivoValidated(itemId, apiData)
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado exitosamente.",
        })
      } else {
        // Crear nuevo item
        await createInventarioActivoValidated(apiData)
        toast({
          title: "Producto creado",
          description: "El producto se ha agregado exitosamente al inventario.",
        })
      }

      // Limpiar formulario y cerrar
      setFormData({})
      onSave() // Notificar que se guardó para recargar la tabla
      onClose()
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast({
        title: "Error",
        description: editingItem 
          ? "No se pudo actualizar el producto. Intenta nuevamente." 
          : "No se pudo crear el producto. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof InventoryItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingItem ? "Editar Producto" : "Agregar Nuevo Producto"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {editingItem ? "Modifica los datos del producto." : "Completa la información del nuevo producto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Laptop Dell"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={formData.category || ""} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrónicos">Electrónicos</SelectItem>
                  <SelectItem value="Accesorios">Accesorios</SelectItem>
                  <SelectItem value="Oficina">Oficina</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Mobiliario">Mobiliario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity || 0}
                onChange={(e) => handleInputChange("quantity", Number.parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock || 0}
                onChange={(e) => handleInputChange("minStock", Number.parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio (COP)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price || 0}
              onChange={(e) => handleInputChange("price", Number.parseInt(e.target.value) || 0)}
              min="0"
              step="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Proveedor</Label>
            <Input
              id="supplier"
              value={formData.supplier || ""}
              onChange={(e) => handleInputChange("supplier", e.target.value)}
              placeholder="Ej: Dell Colombia"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (editingItem ? "Actualizando..." : "Agregando...") : (editingItem ? "Actualizar" : "Agregar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
