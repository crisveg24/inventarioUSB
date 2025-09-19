/**
 * Funciones para crear nuevos activos en el inventario
 * POST /inventario/ - Crear un nuevo activo
 */

import {
  InventarioActivoCreate,
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
 * Crea un nuevo activo en el inventario
 * @param activoData - Datos del activo a crear
 * @returns Promise con el activo creado (incluyendo ID)
 */
export async function createInventarioActivo(
  activoData: InventarioActivoCreate
): Promise<InventarioActivoOut> {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTARIO);

    const response = await fetch(url, {
      ...defaultFetchConfig,
      method: "POST",
      body: JSON.stringify(activoData),
    });

    return await handleApiResponse<InventarioActivoOut>(response);
  } catch (error) {
    console.error("Error al crear activo:", error);
    throw error;
  }
}

/**
 * Crea un nuevo activo con manejo de estado para componentes React
 * @param activoData - Datos del activo a crear
 * @returns Promise con respuesta que incluye manejo de errores
 */
export async function createInventarioActivoWithState(
  activoData: InventarioActivoCreate
): Promise<ApiResponse<InventarioActivoOut>> {
  try {
    const data = await createInventarioActivo(activoData);
    return {
      data,
      status: 200,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Error al crear el activo",
      status: 500,
    };
  }
}

/**
 * Valida los datos antes de crear un activo
 * @param activoData - Datos del activo a validar
 * @returns true si los datos son válidos, string con error si no
 */
export function validateInventarioActivoData(
  activoData: InventarioActivoCreate
): true | string {
  // Validaciones básicas
  if (!activoData.NOMBRE_DEL_ACTIVO?.trim()) {
    return "El nombre del activo es requerido";
  }

  if (!activoData.TIPO_DE_ACTIVO?.trim()) {
    return "El tipo de activo es requerido";
  }

  if (!activoData.DUEÑO_DE_ACTIVO?.trim()) {
    return "El dueño del activo es requerido";
  }

  // Aquí puedes agregar más validaciones según tus reglas de negocio

  return true;
}

/**
 * Crea un activo con validación previa
 * @param activoData - Datos del activo a crear
 * @returns Promise con el activo creado
 */
export async function createInventarioActivoValidated(
  activoData: InventarioActivoCreate
): Promise<InventarioActivoOut> {
  const validation = validateInventarioActivoData(activoData);

  if (validation !== true) {
    throw new Error(validation);
  }

  return createInventarioActivo(activoData);
}
