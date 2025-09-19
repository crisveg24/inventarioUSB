/**
 * Funciones para obtener datos del inventario
 * GET /inventario/ - Obtener lexport async function getInventarioActivoById(
  activoId: number
): Promise<InventarioActivoOut> {
  try {
    // Como INVENTARIO ya tiene barra final, construir la URL correctamente
    const endpoint = API_CONFIG.ENDPOINTS.INVENTARIO + activoId;
    const url = buildApiUrl(endpoint);

    console.log("🔗 Obteniendo activo por ID:", activoId, "URL:", url);

    // Usar safeFetch también para requests individuales
    const response = await safeFetch(url, 10000);

    return await handleApiResponse<InventarioActivoOut>(response);
  } catch (error) {
    console.error(`❌ Error al obtener activo con ID ${activoId}:`, error);
    throw error;
  }
} * GET /inventario/{activo_id} - Obtener un activo específico
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
  //createFetchConfigWithTimeout,
  safeFetch,
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



    // Usar la función safeFetch que maneja múltiples estrategias
    const response = await safeFetch(url, 15000);

   /* console.log("✅ Respuesta recibida:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });*/

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}. URL: ${url}`);
    }

    const data = await handleApiResponse<InventarioActivoList>(response);
    //console.log("📦 Datos procesados:", data?.length || 0, "activos");

    return data;
  } catch (error) {
    console.error("❌ Error detallado al obtener inventario de activos:", {
      error,
      message: error instanceof Error ? error.message : "Error desconocido",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : "UnknownError",
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
