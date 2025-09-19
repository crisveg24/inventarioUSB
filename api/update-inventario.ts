/**
 * Funciones para actualizar activos existentes en el inventario
 * PUT /inventario/{activo_id} - Actualizar un activo específico
 */

import {
  InventarioActivoUpdate,
  InventarioActivoOut,
  ApiResponse,
} from "./types/inventario";
import {
  buildApiUrl,
  defaultFetchConfig,
  handleApiResponse,
  API_CONFIG,
} from "./config";

/**
 * Actualiza un activo existente en el inventario
 * @param activoId - ID del activo a actualizar
 * @param activoData - Datos actualizados del activo
 * @returns Promise con el activo actualizado
 */
export async function updateInventarioActivo(
  activoId: number,
  activoData: InventarioActivoUpdate
): Promise<InventarioActivoOut> {
  try {
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.INVENTARIO}/${activoId}`);

    const response = await fetch(url, {
      ...defaultFetchConfig,
      method: "PUT",
      body: JSON.stringify(activoData),
    });

    return await handleApiResponse<InventarioActivoOut>(response);
  } catch (error) {
    console.error(`Error al actualizar activo con ID ${activoId}:`, error);
    throw error;
  }
}

/**
 * Actualiza un activo con manejo de estado para componentes React
 * @param activoId - ID del activo a actualizar
 * @param activoData - Datos actualizados del activo
 * @returns Promise con respuesta que incluye manejo de errores
 */
export async function updateInventarioActivoWithState(
  activoId: number,
  activoData: InventarioActivoUpdate
): Promise<ApiResponse<InventarioActivoOut>> {
  try {
    const data = await updateInventarioActivo(activoId, activoData);
    return {
      data,
      status: 200,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error al actualizar el activo",
      status: 500,
    };
  }
}

/**
 * Actualiza parcialmente un activo (solo los campos proporcionados)
 * @param activoId - ID del activo a actualizar
 * @param partialData - Datos parciales a actualizar
 * @returns Promise con el activo actualizado
 */
export async function patchInventarioActivo(
  activoId: number,
  partialData: Partial<InventarioActivoUpdate>
): Promise<InventarioActivoOut> {
  try {
    // Filtrar campos undefined/null para enviar solo los campos que realmente se quieren actualizar
    const filteredData = Object.fromEntries(
      Object.entries(partialData).filter(([_, value]) => value !== undefined)
    );

    return await updateInventarioActivo(
      activoId,
      filteredData as InventarioActivoUpdate
    );
  } catch (error) {
    console.error(
      `Error al actualizar parcialmente activo con ID ${activoId}:`,
      error
    );
    throw error;
  }
}

/**
 * Valida los datos antes de actualizar un activo
 * @param activoData - Datos del activo a validar
 * @returns true si los datos son válidos, string con error si no
 */
export function validateUpdateInventarioActivoData(
  activoData: InventarioActivoUpdate
): true | string {
  // Validaciones básicas para actualización
  if (
    activoData.NOMBRE_DEL_ACTIVO !== undefined &&
    !activoData.NOMBRE_DEL_ACTIVO?.trim()
  ) {
    return "El nombre del activo no puede estar vacío";
  }

  if (
    activoData.TIPO_DE_ACTIVO !== undefined &&
    !activoData.TIPO_DE_ACTIVO?.trim()
  ) {
    return "El tipo de activo no puede estar vacío";
  }

  if (
    activoData.DUEÑO_DE_ACTIVO !== undefined &&
    !activoData.DUEÑO_DE_ACTIVO?.trim()
  ) {
    return "El dueño del activo no puede estar vacío";
  }

  // Aquí puedes agregar más validaciones según tus reglas de negocio

  return true;
}

/**
 * Actualiza un activo con validación previa
 * @param activoId - ID del activo a actualizar
 * @param activoData - Datos del activo a actualizar
 * @returns Promise con el activo actualizado
 */
export async function updateInventarioActivoValidated(
  activoId: number,
  activoData: InventarioActivoUpdate
): Promise<InventarioActivoOut> {
  const validation = validateUpdateInventarioActivoData(activoData);

  if (validation !== true) {
    throw new Error(validation);
  }

  return updateInventarioActivo(activoId, activoData);
}
