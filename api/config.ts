/**
 * Configuración principal para las llamadas a la API
 * Lee la BASE_URL desde las variables de entorno
 */

// Obtener la URL base desde las variables de entorno
export const API_CONFIG = {
  // En desarrollo, usar el proxy local para evitar CORS
  BASE_URL: process.env.NODE_ENV === 'development' 
    ? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000') + '/api/proxy'
    : process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventoryapp.usbtopia.usbbog.edu.co",
  
  // URL externa real (para referencia y configuración)
  EXTERNAL_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://inventoryapp.usbtopia.usbbog.edu.co",
  
  ENDPOINTS: {
    INVENTARIO: "/inventario/", // Endpoint que se pasará al proxy
  },
  DEFAULT_HEADERS: {
    "Accept": "application/json",
  },
  SIMPLE_HEADERS: {
    "Accept": "*/*",
  },
} as const;

/**
 * Construye la URL completa para un endpoint
 * En desarrollo usa el proxy local, en producción usa la API externa
 * @param endpoint - El endpoint relativo (ej: '/inventario/')
 * @param params - Parámetros adicionales para la URL
 * @returns URL completa
 */
export function buildApiUrl(
  endpoint: string,
  params?: Record<string, string | number>
): string {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // En desarrollo, usar el proxy local
    const proxyUrl = new URL('/api/proxy', API_CONFIG.BASE_URL);
    
    // Agregar el endpoint como parámetro
    proxyUrl.searchParams.set('endpoint', endpoint);
    
    // Agregar otros parámetros
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        proxyUrl.searchParams.set(key, value.toString());
      });
    }
    
    const finalUrl = proxyUrl.toString();
    console.log("🔗 URL del proxy construida:", {
      endpoint,
      params,
      finalUrl,
      mode: "development-proxy"
    });
    
    return finalUrl;
  } else {
    // En producción, usar la API externa directamente
    let baseUrl = API_CONFIG.EXTERNAL_BASE_URL;
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    const url = new URL(endpoint, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });
    }

    const finalUrl = url.toString();
    console.log("🔗 URL externa construida:", {
      baseUrl,
      endpoint,
      params,
      finalUrl,
      mode: "production-direct"
    });

    return finalUrl;
  }
}

/**
 * Configuración para fetch requests
 */
export const defaultFetchConfig: RequestInit = {
  headers: API_CONFIG.DEFAULT_HEADERS,
  mode: "cors",
  cache: "no-cache",
  redirect: "follow", // Permitir redirects
};

/**
 * Configuración simple para evitar preflight
 */
export const simpleFetchConfig: RequestInit = {
  headers: API_CONFIG.SIMPLE_HEADERS,
  mode: "cors",
  cache: "no-cache",
  redirect: "follow",
};

/**
 * Crea configuración de fetch con timeout personalizado
 * @param timeoutMs - Timeout en milisegundos (por defecto 10 segundos)
 * @param useSimpleHeaders - Si usar headers simples para evitar preflight
 * @returns Configuración de fetch con timeout
 */
export function createFetchConfigWithTimeout(
  timeoutMs: number = 10000, 
  useSimpleHeaders: boolean = false
): RequestInit {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const baseConfig = useSimpleHeaders ? simpleFetchConfig : defaultFetchConfig;
  
  return {
    ...baseConfig,
    signal: controller.signal,
  };
}

/**
 * Función para hacer requests que usa el proxy en desarrollo
 * @param url - URL completa para la solicitud
 * @param timeoutMs - Timeout en milisegundos
 * @returns Promise con la respuesta
 */
export async function safeFetch(url: string, timeoutMs: number = 15000): Promise<Response> {
  console.log("🔄 Realizando solicitud:", url);
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // En desarrollo, usar fetch normal al proxy (sin problemas de CORS)
    console.log("📡 Modo desarrollo: usando proxy local");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-cache",
      });
      
      clearTimeout(timeoutId);
      console.log("✅ Respuesta del proxy:", response.status, response.statusText);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } else {
    // En producción, usar la estrategia original
    console.log("📡 Modo producción: usando estrategias CORS");
    
    // Estrategia 1: Headers simples para evitar preflight
    try {
      console.log("📡 Intento 1: Headers simples (sin preflight)");
      const simpleConfig = createFetchConfigWithTimeout(timeoutMs, true);
      const response = await fetch(url, {
        ...simpleConfig,
        method: "GET",
      });
      
      console.log("✅ Éxito con headers simples:", response.status);
      return response;
    } catch (error) {
      console.warn("⚠️ Falló con headers simples:", error);
      
      // Estrategia 2: Headers completos
      try {
        console.log("📡 Intento 2: Headers completos");
        const fullConfig = createFetchConfigWithTimeout(timeoutMs, false);
        const response = await fetch(url, {
          ...fullConfig,
          method: "GET",
        });
        
        console.log("✅ Éxito con headers completos:", response.status);
        return response;
      } catch (secondError) {
        console.error("❌ Todas las estrategias fallaron en producción");
        throw secondError;
      }
    }
  }
}

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
