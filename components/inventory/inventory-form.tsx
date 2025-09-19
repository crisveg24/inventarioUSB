"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createInventarioActivoValidated, updateInventarioActivoValidated } from "@/api"
import { InventarioActivoOut, InventarioActivoCreate } from "@/api/types/inventario"

interface InventoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  editingItem?: InventarioActivoOut | null
}

export function InventoryForm({ isOpen, onClose, onSave, editingItem }: InventoryFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<InventarioActivoCreate>>({
    NOMBRE_DEL_ACTIVO: "",
    DESCRIPCION: "",
    TIPO_DE_ACTIVO: "",
    PROCESO: "",
    DUEÑO_DE_ACTIVO: "",
    CONFIDENCIALIDAD: "",
    DISPONIBILIDAD: "",
    INTEGRIDAD: "",
    CRITICIDAD_TOTAL_DEL_ACTIVO: "",
    FORMATO: "",
    MEDIO_DE_CONSERVACIÓN: "",
  })

  useEffect(() => {
    if (editingItem) {
      setFormData({
        NOMBRE_DEL_ACTIVO: editingItem.NOMBRE_DEL_ACTIVO || "",
        DESCRIPCION: editingItem.DESCRIPCION || "",
        TIPO_DE_ACTIVO: editingItem.TIPO_DE_ACTIVO || "",
        PROCESO: editingItem.PROCESO || "",
        DUEÑO_DE_ACTIVO: editingItem.DUEÑO_DE_ACTIVO || "",
        CONFIDENCIALIDAD: editingItem.CONFIDENCIALIDAD || "",
        DISPONIBILIDAD: editingItem.DISPONIBILIDAD || "",
        INTEGRIDAD: editingItem.INTEGRIDAD || "",
        CRITICIDAD_TOTAL_DEL_ACTIVO: editingItem.CRITICIDAD_TOTAL_DEL_ACTIVO || "",
        FORMATO: editingItem.FORMATO || "",
        MEDIO_DE_CONSERVACIÓN: editingItem.MEDIO_DE_CONSERVACIÓN || "",
      })
    } else {
      setFormData({
        NOMBRE_DEL_ACTIVO: "",
        DESCRIPCION: "",
        TIPO_DE_ACTIVO: "",
        PROCESO: "",
        DUEÑO_DE_ACTIVO: "",
        CONFIDENCIALIDAD: "Bajo",
        DISPONIBILIDAD: "Medio",
        INTEGRIDAD: "Medio",
        CRITICIDAD_TOTAL_DEL_ACTIVO: "Bajo",
        FORMATO: "Digital",
        MEDIO_DE_CONSERVACIÓN: "Digital",
      })
    }
  }, [editingItem, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Crear objeto con datos del API directamente
      const apiData: InventarioActivoCreate = {
        NOMBRE_DEL_ACTIVO: formData.NOMBRE_DEL_ACTIVO,
        DESCRIPCION: formData.DESCRIPCION,
        TIPO_DE_ACTIVO: formData.TIPO_DE_ACTIVO,
        MEDIO_DE_CONSERVACIÓN: formData.MEDIO_DE_CONSERVACIÓN || 'Digital',
        FORMATO: formData.FORMATO || 'Digital',
        IDIOMA: 'Español',
        PROCESO: formData.PROCESO,
        DUEÑO_DE_ACTIVO: formData.DUEÑO_DE_ACTIVO,
        TIPO_DE_DATOS_PERSONALES: 'No aplica',
        FINALIDAD_DE_LA_RECOLECCIÓN: 'Gestión de inventario',
        CONFIDENCIALIDAD: formData.CONFIDENCIALIDAD,
        INTEGRIDAD: formData.INTEGRIDAD,
        DISPONIBILIDAD: formData.DISPONIBILIDAD,
        CRITICIDAD_TOTAL_DEL_ACTIVO: formData.CRITICIDAD_TOTAL_DEL_ACTIVO,
        INFORMACIÓN_PUBLICADA_O_DISPONIBLE: 'No',
        LUGAR_DE_CONSULTA: 'Sistema de inventario',
      }

      if (editingItem) {
        // Actualizar item existente
        await updateInventarioActivoValidated(editingItem.id, apiData)
        toast({
          title: "Activo actualizado",
          description: "El activo se ha actualizado exitosamente.",
        })
      } else {
        // Crear nuevo item
        await createInventarioActivoValidated(apiData)
        toast({
          title: "Activo creado",
          description: "El activo se ha agregado exitosamente al inventario.",
        })
      }

      // Limpiar formulario y cerrar
      setFormData({})
      onSave() // Notificar que se guardó para recargar la tabla
      onClose()
    } catch (error) {
      console.error('Error al guardar activo:', error)
      toast({
        title: "Error",
        description: editingItem 
          ? "No se pudo actualizar el activo. Intenta nuevamente." 
          : "No se pudo crear el activo. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof InventarioActivoCreate, value: string) => {
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
          {/* Nombre del Activo */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Activo *</Label>
            <Input
              id="nombre"
              value={formData.NOMBRE_DEL_ACTIVO || ""}
              onChange={(e) => handleInputChange("NOMBRE_DEL_ACTIVO", e.target.value)}
              placeholder="Ej: Laptop Dell Inspiron"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.DESCRIPCION || ""}
              onChange={(e) => handleInputChange("DESCRIPCION", e.target.value)}
              placeholder="Descripción detallada del activo"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo de Activo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Activo *</Label>
              <Select value={formData.TIPO_DE_ACTIVO || ""} onValueChange={(value) => handleInputChange("TIPO_DE_ACTIVO", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo de información">Activo de información</SelectItem>
                  <SelectItem value="Activo físico">Activo físico</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Hardware">Hardware</SelectItem>
                  <SelectItem value="Documentos">Documentos</SelectItem>
                  <SelectItem value="Base de datos">Base de datos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Proceso */}
            <div className="space-y-2">
              <Label htmlFor="proceso">Proceso *</Label>
              <Select value={formData.PROCESO || ""} onValueChange={(value) => handleInputChange("PROCESO", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proceso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gestión de IT">Gestión de IT</SelectItem>
                  <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                  <SelectItem value="Operaciones">Operaciones</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                  <SelectItem value="Seguridad">Seguridad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dueño del Activo */}
          <div className="space-y-2">
            <Label htmlFor="dueno">Dueño del Activo *</Label>
            <Input
              id="dueno"
              value={formData.DUEÑO_DE_ACTIVO || ""}
              onChange={(e) => handleInputChange("DUEÑO_DE_ACTIVO", e.target.value)}
              placeholder="Ej: Juan Pérez, Departamento IT"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Confidencialidad */}
            <div className="space-y-2">
              <Label htmlFor="confidencialidad">Confidencialidad</Label>
              <Select value={formData.CONFIDENCIALIDAD || ""} onValueChange={(value) => handleInputChange("CONFIDENCIALIDAD", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Disponibilidad */}
            <div className="space-y-2">
              <Label htmlFor="disponibilidad">Disponibilidad</Label>
              <Select value={formData.DISPONIBILIDAD || ""} onValueChange={(value) => handleInputChange("DISPONIBILIDAD", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Integridad */}
            <div className="space-y-2">
              <Label htmlFor="integridad">Integridad</Label>
              <Select value={formData.INTEGRIDAD || ""} onValueChange={(value) => handleInputChange("INTEGRIDAD", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Criticidad */}
            <div className="space-y-2">
              <Label htmlFor="criticidad">Criticidad Total</Label>
              <Select value={formData.CRITICIDAD_TOTAL_DEL_ACTIVO || ""} onValueChange={(value) => handleInputChange("CRITICIDAD_TOTAL_DEL_ACTIVO", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de criticidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bajo">Bajo</SelectItem>
                  <SelectItem value="Medio">Medio</SelectItem>
                  <SelectItem value="Alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Formato */}
            <div className="space-y-2">
              <Label htmlFor="formato">Formato</Label>
              <Select value={formData.FORMATO || ""} onValueChange={(value) => handleInputChange("FORMATO", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Digital">Digital</SelectItem>
                  <SelectItem value="Físico">Físico</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Medio de Conservación */}
          <div className="space-y-2">
            <Label htmlFor="medio">Medio de Conservación</Label>
            <Select value={formData.MEDIO_DE_CONSERVACIÓN || ""} onValueChange={(value) => handleInputChange("MEDIO_DE_CONSERVACIÓN", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar medio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Digital">Digital</SelectItem>
                <SelectItem value="Físico">Físico</SelectItem>
                <SelectItem value="Nube">Nube</SelectItem>
                <SelectItem value="Servidor local">Servidor local</SelectItem>
                <SelectItem value="Archivo físico">Archivo físico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (editingItem ? "Actualizando..." : "Creando...") : (editingItem ? "Actualizar Activo" : "Crear Activo")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
