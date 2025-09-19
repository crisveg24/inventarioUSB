/**
 * Configuración principal para las llamadas a la API
 * Lee la BASE_URL desde las variables de entorno
 */

// Obtener la URL base desde las variables de entorno
export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://inventoryapp.usbtopia.usbbog.edu.co",
  ENDPOINTS: {
    INVENTARIO: "/inventario",
  },
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

/**
 * Construye la URL completa para un endpoint
 * @param endpoint - El endpoint relativo (ej: '/inventario')
 * @param params - Parámetros adicionales para la URL
 * @returns URL completa
 */
export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string | number>
): string {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });
  }

  const finalUrl = url.toString();
  console.log("🔗 URL construida:", {
    baseUrl: API_CONFIG.BASE_URL,
    endpoint,
    params,
    finalUrl,
  });

  return finalUrl;
}

/**
 * Configuración para fetch requests
 */
export const defaultFetchConfig: RequestInit = {
  headers: API_CONFIG.DEFAULT_HEADERS,
  mode: "cors",
  cache: "no-cache",
};

/**
 * Maneja errores de respuesta HTTP
 * @param response - Respuesta de fetch
 * @returns Promise que se resuelve si la respuesta es exitosa
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;

    try {
      const errorData = await response.json();
      if (errorData.detail) {
        // Error de validación de FastAPI
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err: any) => err.msg).join(", ");
        } else {
          errorMessage = errorData.detail;
        }
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Si no se puede parsear el JSON, usar el error por defecto
      console.warn("No se pudo parsear la respuesta de error:", e);
    }

    throw new Error(errorMessage);
  }

  try {
    return await response.json();
  } catch (e) {
    throw new Error("Error al parsear la respuesta JSON");
  }
}
