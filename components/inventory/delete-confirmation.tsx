"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName?: string
}

export function DeleteConfirmation({ isOpen, onClose, onConfirm, itemName }: DeleteConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Esta acción no se puede deshacer. Se eliminará permanentemente el producto
            {itemName && (
              <>
                {" "}
                <span className="font-medium">"{itemName}"</span>
              </>
            )}{" "}
            del inventario.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
