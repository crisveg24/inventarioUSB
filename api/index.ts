/**
 * Archivo principal de la API - Exporta todas las funciones disponibles
 * Importa este archivo para acceder a todas las funciones de la API
 */

// Exportar tipos
export * from "./types/inventario";

// Exportar configuración
export * from "./config";

// Exportar funciones para obtener datos
export * from "./get-inventario";

// Exportar funciones para crear datos
export * from "./create-inventario";

// Exportar funciones para actualizar datos
export * from "./update-inventario";

// Exportar funciones para eliminar datos
export * from "./delete-inventario";

/**
 * Objeto principal que agrupa todas las funciones de la API
 * Uso recomendado: import { InventarioAPI } from './api'
 */
export const InventarioAPI = {
  // Obtener datos
  getActivos: async (params = {}) =>
    (await import("./get-inventario")).getInventarioActivos(params),
  getActivoById: async (id: number) =>
    (await import("./get-inventario")).getInventarioActivoById(id),

  // Crear datos
  createActivo: async (data: any) =>
    (await import("./create-inventario")).createInventarioActivo(data),
  createActivoValidated: async (data: any) =>
    (await import("./create-inventario")).createInventarioActivoValidated(data),

  // Actualizar datos
  updateActivo: async (id: number, data: any) =>
    (await import("./update-inventario")).updateInventarioActivo(id, data),
  updateActivoValidated: async (id: number, data: any) =>
    (await import("./update-inventario")).updateInventarioActivoValidated(
      id,
      data
    ),
  patchActivo: async (id: number, data: any) =>
    (await import("./update-inventario")).patchInventarioActivo(id, data),

  // Eliminar datos
  deleteActivo: async (id: number) =>
    (await import("./delete-inventario")).deleteInventarioActivo(id),
  deleteActivoValidated: async (id: number) =>
    (await import("./delete-inventario")).deleteInventarioActivoValidated(id),
  deleteActivoWithConfirmation: async (id: number, message?: string) =>
    (
      await import("./delete-inventario")
    ).deleteInventarioActivoWithConfirmation(id, message),
  deleteMultipleActivos: async (ids: number[]) =>
    (await import("./delete-inventario")).deleteMultipleInventarioActivos(ids),
};

/**
 * Funciones con manejo de estado para componentes React
 */
export const InventarioAPIWithState = {
  getActivos: async (params = {}) =>
    (await import("./get-inventario")).fetchInventarioWithState(params),
  getActivoById: async (id: number) =>
    (await import("./get-inventario")).fetchInventarioByIdWithState(id),
  createActivo: async (data: any) =>
    (await import("./create-inventario")).createInventarioActivoWithState(data),
  updateActivo: async (id: number, data: any) =>
    (await import("./update-inventario")).updateInventarioActivoWithState(
      id,
      data
    ),
  deleteActivo: async (id: number) =>
    (await import("./delete-inventario")).deleteInventarioActivoWithState(id),
};
