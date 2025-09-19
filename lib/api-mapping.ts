/**
 * Utilidades para mapear datos entre la API y el formato interno de la aplicación
 */

import { InventarioActivoOut } from "@/api/types/inventario";
import { InventoryItem } from "@/lib/inventory-data";

/**
 * Mapea un activo de la API al formato InventoryItem
 */
export function mapApiActivoToInventoryItem(
  activo: InventarioActivoOut
): InventoryItem {
  // Determinar el estado basado en disponibilidad
  const getStatus = (
    disponibilidad: string | null
  ): InventoryItem["status"] => {
    if (!disponibilidad) return "out-of-stock";

    const disp = disponibilidad.toLowerCase();
    if (
      disp.includes("alto") ||
      disp.includes("disponible") ||
      disp.includes("activo")
    ) {
      return "in-stock";
    } else if (disp.includes("medio") || disp.includes("limitado")) {
      return "low-stock";
    } else {
      return "out-of-stock";
    }
  };

  // Extraer un valor numérico de criticidad para usar como cantidad
  const getQuantityFromCriticidad = (criticidad: string | null): number => {
    if (!criticidad) return 0;

    const crit = criticidad.toLowerCase();
    if (crit.includes("alto") || crit.includes("crítico")) return 5;
    if (crit.includes("medio")) return 15;
    if (crit.includes("bajo")) return 25;
    return 10; // valor por defecto
  };

  return {
    id: activo.id.toString(),
    name: activo.NOMBRE_DEL_ACTIVO || "Sin nombre",
    category: activo.TIPO_DE_ACTIVO || "Sin categoría",
    quantity: getQuantityFromCriticidad(
      activo.CRITICIDAD_TOTAL_DEL_ACTIVO || null
    ),
    minStock: 5, // valor por defecto
    price: 0, // no hay precio en la API, usar 0
    supplier: activo.DUEÑO_DE_ACTIVO || "Sin proveedor",
    lastUpdated: new Date().toISOString().split("T")[0], // fecha actual
    status: getStatus(activo.DISPONIBILIDAD || null),
  };
}

/**
 * Mapea un InventoryItem al formato de la API para crear/actualizar
 */
export function mapInventoryItemToApiActivo(item: Partial<InventoryItem>): any {
  return {
    NOMBRE_DEL_ACTIVO: item.name,
    DESCRIPCION: `Producto: ${item.name}`,
    TIPO_DE_ACTIVO: item.category,
    MEDIO_DE_CONSERVACIÓN: "Digital",
    FORMATO: "Electrónico",
    IDIOMA: "Español",
    PROCESO: "Gestión de Inventario",
    DUEÑO_DE_ACTIVO: item.supplier,
    TIPO_DE_DATOS_PERSONALES: "No aplica",
    FINALIDAD_DE_LA_RECOLECCIÓN: "Control de inventario",
    CONFIDENCIALIDAD: "Media",
    INTEGRIDAD: "Alta",
    DISPONIBILIDAD:
      item.status === "in-stock"
        ? "Alta"
        : item.status === "low-stock"
        ? "Media"
        : "Baja",
    CRITICIDAD_TOTAL_DEL_ACTIVO:
      item.quantity && item.quantity <= 5
        ? "Alta"
        : item.quantity && item.quantity <= 15
        ? "Media"
        : "Baja",
    INFORMACIÓN_PUBLICADA_O_DISPONIBLE: "No",
    LUGAR_DE_CONSULTA: "Sistema de inventario",
  };
}
