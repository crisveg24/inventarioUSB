/**
 * Funciones para eliminar activos del inventario
 * DELETE /inventario/{activo_id} - Eliminar un activo específico
 */

import { InventarioActivoOut, ApiResponse } from "./types/inventario";
import {
  buildApiUrl,
  defaultFetchConfig,
  handleApiResponse,
  API_CONFIG,
} from "./config";

/**
 * Elimina un activo del inventario
 * @param activoId - ID del activo a eliminar
 * @returns Promise con el activo eliminado
 */
export async function deleteInventarioActivo(
  activoId: number
): Promise<InventarioActivoOut> {
  try {
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.INVENTARIO}/${activoId}`);

    const response = await fetch(url, {
      ...defaultFetchConfig,
      method: "DELETE",
    });

    return await handleApiResponse<InventarioActivoOut>(response);
  } catch (error) {
    console.error(`Error al eliminar activo con ID ${activoId}:`, error);
    throw error;
  }
}

/**
 * Elimina un activo con manejo de estado para componentes React
 * @param activoId - ID del activo a eliminar
 * @returns Promise con respuesta que incluye manejo de errores
 */
export async function deleteInventarioActivoWithState(
  activoId: number
): Promise<ApiResponse<InventarioActivoOut>> {
  try {
    const data = await deleteInventarioActivo(activoId);
    return {
      data,
      status: 200,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Error al eliminar el activo",
      status: 500,
    };
  }
}

/**
 * Elimina múltiples activos de forma secuencial
 * @param activoIds - Array de IDs de activos a eliminar
 * @returns Promise con array de resultados de eliminación
 */
export async function deleteMultipleInventarioActivos(
  activoIds: number[]
): Promise<ApiResponse<InventarioActivoOut>[]> {
  const results: ApiResponse<InventarioActivoOut>[] = [];

  for (const activoId of activoIds) {
    try {
      const result = await deleteInventarioActivoWithState(activoId);
      results.push(result);
    } catch (error) {
      results.push({
        error: error instanceof Error ? error.message : "Error desconocido",
        status: 500,
      });
    }
  }

  return results;
}

/**
 * Elimina múltiples activos de forma paralela (más rápido pero puede sobrecargar el servidor)
 * @param activoIds - Array de IDs de activos a eliminar
 * @returns Promise con array de resultados de eliminación
 */
export async function deleteMultipleInventarioActivosParallel(
  activoIds: number[]
): Promise<ApiResponse<InventarioActivoOut>[]> {
  const deletePromises = activoIds.map((activoId) =>
    deleteInventarioActivoWithState(activoId)
  );

  return Promise.all(deletePromises);
}

/**
 * Valida si un activo puede ser eliminado
 * @param activoId - ID del activo a validar
 * @returns true si puede ser eliminado, string con error si no
 */
export function validateDeleteInventarioActivo(
  activoId: number
): true | string {
  if (!activoId || activoId <= 0) {
    return "ID de activo inválido";
  }

  // Aquí puedes agregar más validaciones, por ejemplo:
  // - Verificar si el activo tiene dependencias
  // - Verificar permisos del usuario
  // - Verificar estado del activo

  return true;
}

/**
 * Elimina un activo con validación previa
 * @param activoId - ID del activo a eliminar
 * @returns Promise con el activo eliminado
 */
export async function deleteInventarioActivoValidated(
  activoId: number
): Promise<InventarioActivoOut> {
  const validation = validateDeleteInventarioActivo(activoId);

  if (validation !== true) {
    throw new Error(validation);
  }

  return deleteInventarioActivo(activoId);
}

/**
 * Solicita confirmación antes de eliminar (para usar en componentes)
 * @param activoId - ID del activo a eliminar
 * @param confirmationMessage - Mensaje de confirmación personalizado
 * @returns Promise que se resuelve solo si el usuario confirma
 */
export async function deleteInventarioActivoWithConfirmation(
  activoId: number,
  confirmationMessage?: string
): Promise<InventarioActivoOut> {
  const message =
    confirmationMessage ||
    `¿Estás seguro de que quieres eliminar el activo con ID ${activoId}? Esta acción no se puede deshacer.`;

  if (typeof window !== "undefined" && !window.confirm(message)) {
    throw new Error("Eliminación cancelada por el usuario");
  }

  return deleteInventarioActivo(activoId);
}
