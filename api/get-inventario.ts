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
import { getCurrentUser } from "@/lib/auth";

// Mapeo de roles para filtrado flexible
const ROLE_MAPPING: Record<string, string[]> = {
  "Jefe Oficina de Control Interno": [
    "Jefe Oficina de Control Interno",
    "Control Interno",
    "Oficina de Control Interno"
  ],
  "Subdirección Financiera y Administrativa": [
    "Subdirección Financiera y Administrativa",
    "Subdirección Financiera",
    "Financiera y Administrativa",
    "Financiera"
  ],
  "Asesor de la Dirección para Comunicaciones y Servicio al Ciudadano": [
    "Asesor de la Dirección para Comunicaciones y Servicio al Ciudadano",
    "Asesor de la Dirección",
    "Comunicaciones y Servicio al Ciudadano",
    "Comunicaciones",
    "Servicio al Ciudadano"
  ],
  "Oficina de Control Disciplinario Interno": [
    "Oficina de Control Disciplinario Interno",
    "Control Disciplinario Interno",
    "Control Disciplinario",
    "Disciplinario"
  ]
}

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

    // Aplicar filtro por DUEÑO_DE_ACTIVO si el usuario no es admin
    const currentUser = getCurrentUser()
    if (currentUser && !currentUser.canViewAll) {
      const filteredData = data.filter(activo => {
        const activoOwner = activo.DUEÑO_DE_ACTIVO?.trim()
        const userRole = currentUser.role.trim()
        
        // Comparación exacta
        const exactMatch = activoOwner === userRole
        
        // Comparación usando mapeo de roles
        const roleVariations = ROLE_MAPPING[userRole] || [userRole]
        const mappingMatch = roleVariations.some(variation => 
          activoOwner && activoOwner.includes(variation)
        )
        
        // Comparación flexible (contiene la parte principal)
        const flexibleMatch = activoOwner && userRole && 
          (activoOwner.includes(userRole) || userRole.includes(activoOwner))
        
        const match = exactMatch || mappingMatch || flexibleMatch
        
        console.log(`Comparando: "${activoOwner}" === "${userRole}" = ${exactMatch} (mapping: ${mappingMatch}, flexible: ${flexibleMatch})`)
        return match
      })
      console.log(`Filtrado por rol "${currentUser.role}": ${filteredData.length} de ${data.length} activos`)
      return filteredData
    }
    
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
 * Obtiene todos los activos sin filtrado por rol (para filtros)
 * @param params - Parámetros de consulta (skip, limit)
 * @returns Promise con la lista completa de activos
 */
export async function getAllInventarioActivos(
  params: InventarioQueryParams = {}
): Promise<InventarioActivoList> {
  try {
    const { skip = 0, limit = 1000 } = params;
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTARIO, { skip, limit });

    console.log("Obteniendo todos los datos para filtros:", url);

    const response = await fetch(url, {
      ...defaultFetchConfig,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}. URL: ${url}`);
    }

    const data = await handleApiResponse<InventarioActivoList>(response);
    console.log("Datos completos obtenidos:", data?.length || 0, "activos");
    
    // NO aplicar filtrado por rol para los filtros
    return data;
  } catch (error) {
    console.error("Error al obtener todos los activos:", error);
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
