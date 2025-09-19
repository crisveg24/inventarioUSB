"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryForm } from "@/components/inventory/inventory-form"
import { DeleteConfirmation } from "@/components/inventory/delete-confirmation"
import { useToast } from "@/hooks/use-toast"
import { InventarioActivoOut } from "@/api/types/inventario"
import { deleteInventarioActivoValidated } from "@/api"

export default function InventoryPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventarioActivoOut | null>(null)
  const [deletingItem, setDeletingItem] = useState<{ id: number; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Para refrescar la tabla sin reload
  const { toast } = useToast()

  const handleEdit = (item: InventarioActivoOut) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: InventarioActivoOut) => {
    setDeletingItem({ 
      id: item.id, 
      name: item.NOMBRE_DEL_ACTIVO || 'Activo sin nombre' 
    })
    setIsDeleteOpen(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  const handleSave = () => {
    // La función se llama cuando el formulario guarda exitosamente
    setIsFormOpen(false)
    setEditingItem(null)
    
    // Refrescar la tabla incrementando la key
    setRefreshKey(prev => prev + 1)
  }

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    
    setIsLoading(true)
    try {
      await deleteInventarioActivoValidated(deletingItem.id)
      toast({
        title: "Activo eliminado",
        description: `El activo "${deletingItem.name}" ha sido eliminado del inventario.`,
        variant: "destructive",
      })
      setDeletingItem(null)
      setIsDeleteOpen(false)
      
      // Refrescar la tabla incrementando la key
      setRefreshKey(prev => prev + 1)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el activo'
      toast({
        title: "Error al eliminar",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthGuard>
      <AppLayout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestión de Inventario</h1>
              <p className="text-muted-foreground">Administra todos los productos del inventario</p>
            </div>
          </div>

          <InventoryTable onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} refreshKey={refreshKey} />

        <InventoryForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          editingItem={editingItem}
        />          <DeleteConfirmation
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleConfirmDelete}
            itemName={deletingItem?.name}
          />
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
