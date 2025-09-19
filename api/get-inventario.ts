/**
 * Funciones para obtener datos del inventario
 * GET /inventario/ - Obtener lista de activos
 * GET /inventario/{activo_id} - Obtener un activo específico
 */

import {
  InventarioActivoOut,
  InventarioActivoList,
  InventarioQueryParams,
  ApiResponse,
} from "./types/inventario";
import {
  buildApiUrl,
  defaultFetchConfig,
  handleApiResponse,
  API_CONFIG,
} from "./config";

/**
 * Obtiene la lista completa de activos del inventario
 * @param params - Parámetros de consulta (skip, limit)
 * @returns Promise con la lista de activos
 */
export async function getInventarioActivos(
  params: InventarioQueryParams = {}
): Promise<InventarioActivoList> {
  try {
    const { skip = 0, limit = 100 } = params;
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTARIO, { skip, limit });

    console.log("Haciendo petición a:", url);

    const response = await fetch(url, {
      ...defaultFetchConfig,
      method: "GET",
    });

    console.log("Respuesta recibida:", response.status, response.statusText);

    const data = await handleApiResponse<InventarioActivoList>(response);
    console.log("Datos recibidos:", data?.length || 0, "activos");

    return data;
  } catch (error) {
    console.error("Error detallado al obtener inventario de activos:", {
      error,
      message: error instanceof Error ? error.message : "Error desconocido",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

/**
 * Obtiene un activo específico por su ID
 * @param activoId - ID del activo a obtener
 * @returns Promise con el activo encontrado
 */
export async function getInventarioActivoById(
  activoId: number
): Promise<InventarioActivoOut> {
  try {
    const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.INVENTARIO}/${activoId}`);

    const response = await fetch(url, {
      ...defaultFetchConfig,
      method: "GET",
    });

    return await handleApiResponse<InventarioActivoOut>(response);
  } catch (error) {
    console.error(`Error al obtener activo con ID ${activoId}:`, error);
    throw error;
  }
}

/**
 * Hook personalizado para usar en componentes React (opcional)
 * Obtiene la lista de activos con manejo de estado
 */
export async function fetchInventarioWithState(
  params: InventarioQueryParams = {}
): Promise<ApiResponse<InventarioActivoList>> {
  try {
    const data = await getInventarioActivos(params);
    return {
      data,
      status: 200,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error desconocido",
      status: 500,
    };
  }
}

/**
 * Hook personalizado para obtener un activo específico con manejo de estado
 */
export async function fetchInventarioByIdWithState(
  activoId: number
): Promise<ApiResponse<InventarioActivoOut>> {
  try {
    const data = await getInventarioActivoById(activoId);
    return {
      data,
      status: 200,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error desconocido",
      status: 500,
    };
  }
}
