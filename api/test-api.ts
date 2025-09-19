/**
 * Archivo de prueba para verificar la conexión con la API
 * Puedes importar y usar estas funciones para probar la conectividad
 */

import { getInventarioActivos } from "./get-inventario";
import { API_CONFIG, buildApiUrl } from "./config";

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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      mode: "cors",
    });

    console.log("📊 Status:", response.status);
    console.log("📋 Headers:", Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const text = await response.text();
      console.log(
        "📄 Respuesta (primeros 200 caracteres):",
        text.substring(0, 200)
      );
      return { success: true, status: response.status };
    } else {
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
      };
    }
  } catch (error) {
    console.error("❌ Error de conectividad:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
