/**
 * Archivo de prueba para verificar la conexión con la API
 * Puedes importar y usar estas funciones para probar la conectividad
 */

import { getInventarioActivos } from "./get-inventario";
import { API_CONFIG, buildApiUrl, safeFetch } from "./config";

/**
 * Función de prueba para verificar la conexión con la API
 */
export async function testApiConnection() {
  try {
    console.log("🔍 Probando conexión con la API...");
    console.log("📍 URL base configurada:", API_CONFIG.BASE_URL);

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTARIO, {
      skip: 0,
      limit: 5,
    });
    console.log("🌐 URL completa:", url);

    console.log("📡 Enviando petición...");
    const startTime = Date.now();

    const activos = await getInventarioActivos({ skip: 0, limit: 5 });

    const endTime = Date.now();
    console.log(`✅ Conexión exitosa! Tiempo: ${endTime - startTime}ms`);
    console.log(`📊 Datos recibidos: ${activos.length} activos`);

    if (activos.length > 0) {
      console.log("🔍 Primer activo:", {
        id: activos[0].id,
        nombre: activos[0].NOMBRE_DEL_ACTIVO,
        tipo: activos[0].TIPO_DE_ACTIVO,
      });
    }

    return {
      success: true,
      data: activos,
      count: activos.length,
      responseTime: endTime - startTime,
    };
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      details: error,
    };
  }
}

/**
 * Función para probar solo la conectividad básica
 */
export async function testBasicConnectivity() {
  try {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.INVENTARIO, {
      skip: 0,
      limit: 1,
    });
    console.log("🧪 Probando conectividad básica a:", url);

    // Usar safeFetch para manejar problemas de CORS automáticamente
    const response = await safeFetch(url, 10000);

    console.log("📊 Status:", response.status);
    console.log("📋 Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const text = await response.text();
      console.log(
        "📄 Respuesta (primeros 200 caracteres):",
        text.substring(0, 200)
      );
      
      // Intentar parsear como JSON
      try {
        const json = JSON.parse(text);
        return { 
          success: true, 
          status: response.status,
          dataType: Array.isArray(json) ? 'array' : typeof json,
          dataLength: Array.isArray(json) ? json.length : Object.keys(json).length,
          method: 'safeFetch'
        };
      } catch (parseError) {
        return { 
          success: true, 
          status: response.status,
          warning: "Respuesta no es JSON válido",
          responsePreview: text.substring(0, 100),
          method: 'safeFetch'
        };
      }
    } else {
      const errorText = await response.text();
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText.substring(0, 200),
        method: 'safeFetch'
      };
    }
  } catch (error) {
    console.error("❌ Error de conectividad:", error);
    
    let errorType = "unknown";
    let errorMessage = error instanceof Error ? error.message : "Error desconocido";
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorType = "timeout";
        errorMessage = "La solicitud tardó más de 10 segundos";
      } else if (error.message.includes('CORS')) {
        errorType = "cors";
        errorMessage = "Error de CORS - El servidor no permite solicitudes desde este origen";
      } else if (error.message.includes('Failed to fetch')) {
        errorType = "network";
        errorMessage = "Error de red - No se pudo conectar con el servidor";
      } else if (error.message.includes('refused')) {
        errorType = "connection_refused";
        errorMessage = "Conexión rechazada - El servidor no está disponible";
      } else if (error.message.includes('ERR_INVALID_REDIRECT')) {
        errorType = "invalid_redirect";
        errorMessage = "Error de redirección CORS - Problema de configuración del servidor";
      }
    }
    
    return {
      success: false,
      error: errorMessage,
      errorType,
      method: 'safeFetch',
      details: error instanceof Error ? {
        name: error.name,
        message: error.message,
      } : error
    };
  }
}
