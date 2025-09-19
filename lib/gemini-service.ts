// Servicio para integración con Google Gemini AI
export interface GeminiReportRequest {
  query: string
  inventoryData: any[]
}

export interface GeminiReportResponse {
  filteredProducts: any[]
  reportTitle: string
  reportDescription: string
  criteria: string[]
}

const GEMINI_API_KEY = 'AIzaSyBfevJcvq62SnaXd-K8yfuSY92SlbyHEXo'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'

export async function generateReportWithGemini(request: GeminiReportRequest): Promise<GeminiReportResponse> {
  try {
    console.log('🤖 INICIANDO PETICIÓN A GEMINI')
    console.log('📊 Consulta del usuario:', request.query)
    console.log('📦 Productos recibidos:', request.inventoryData.length)
    console.log('🔑 API Key disponible:', GEMINI_API_KEY ? 'SÍ' : 'NO')
    
    // Validar datos de entrada
    if (!request.query || request.query.trim().length === 0) {
      throw new Error('La consulta está vacía')
    }
    
    if (!request.inventoryData || request.inventoryData.length === 0) {
      throw new Error('No hay datos de inventario disponibles')
    }

    // Preparar el prompt optimizado para Gemini con limitación de resultados
    const prompt = `IMPORTANTE: Debes responder ÚNICAMENTE con un JSON válido, sin texto adicional.

TAREA: Analizar la consulta del usuario y filtrar los productos del inventario según sus criterios.
LÍMITE: Devuelve MÁXIMO 20 productos más relevantes para mantener la respuesta concisa.

CONSULTA DEL USUARIO: "${request.query}"

DATOS DEL INVENTARIO (${request.inventoryData.length} productos):
${JSON.stringify(request.inventoryData, null, 2)}

INSTRUCCIONES OBLIGATORIAS:
1. Analiza la consulta para entender qué productos necesita el usuario
2. Filtra los productos según los criterios mencionados
3. Ordena por relevancia y devuelve solo los 20 más importantes
4. Responde SOLO con el JSON en esta estructura exacta:

{
  "filteredProducts": [máximo 20 productos que mejor coincidan con la consulta],
  "reportTitle": "Título descriptivo del reporte",
  "reportDescription": "Descripción de lo que contiene el reporte",
  "criteria": ["criterio1", "criterio2", "criterio3"]
}

EJEMPLOS DE FILTRADO:
- "stock bajo" o "menos stock" = products where quantity <= minStock OR status === "low-stock"
- "sin stock" = products where quantity === 0 OR status === "out-of-stock"  
- "categoría electrónicos" = products where category includes "electrón" or "electronic"
- "precio mayor a X" = products where price > X

PRIORIDAD: Para "menos stock" o "stock bajo", prioriza productos con quantity <= minStock y ordena por quantity ascendente.

RESPUESTA (SOLO JSON, SIN EXPLICACIONES):`

    console.log('📝 Enviando prompt a Gemini...')

    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 Respuesta de Gemini recibida - Status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error en API Gemini:', errorText)
      throw new Error(`Error de API Gemini: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🤖 Respuesta completa de Gemini:', data)

    // Extraer el texto generado
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedText) {
      throw new Error('Gemini no devolvió una respuesta válida')
    }

    console.log('📝 Texto generado por Gemini:', generatedText)

    // Limpiar el texto para extraer solo el JSON
    let cleanedText = generatedText.trim()
    
    // Remover markdown y texto extra
    cleanedText = cleanedText.replace(/```json/g, '').replace(/```/g, '')
    
    // Encontrar el JSON con manejo mejorado para respuestas truncadas
    const firstBrace = cleanedText.indexOf('{')
    let lastBrace = cleanedText.lastIndexOf('}')
    
    if (firstBrace === -1) {
      throw new Error('No se encontró JSON válido en la respuesta de Gemini')
    }

    // Si no se encuentra el cierre o la respuesta parece truncada, intentar reparar
    if (lastBrace === -1 || lastBrace <= firstBrace) {
      console.log('⚠️ JSON parece truncado, intentando reparar...')
      
      // Buscar el último objeto completo en la respuesta
      const textFromFirst = cleanedText.substring(firstBrace)
      
      // Intentar encontrar un punto donde el JSON podría estar completo
      const lastCompleteProduct = textFromFirst.lastIndexOf('"status": "')
      if (lastCompleteProduct !== -1) {
        // Buscar el cierre de ese producto
        const afterStatus = textFromFirst.substring(lastCompleteProduct)
        const nextBrace = afterStatus.indexOf('}')
        if (nextBrace !== -1) {
          // Reconstruir el JSON válido
          const repairedJson = textFromFirst.substring(0, lastCompleteProduct + nextBrace + 1) + 
            '\n    ]\n  }\n}'
          cleanedText = cleanedText.substring(0, firstBrace) + repairedJson
          lastBrace = cleanedText.lastIndexOf('}')
        }
      }
    }
    
    const jsonText = cleanedText.substring(firstBrace, lastBrace + 1)
    console.log('🔍 JSON extraído:', jsonText.length > 1000 ? 
      jsonText.substring(0, 500) + '...[TRUNCADO]...' + jsonText.substring(jsonText.length - 500) : 
      jsonText)

    // Parsear el JSON
    let result
    try {
      result = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError)
      console.error('📝 JSON problemático:', jsonText.substring(jsonText.length - 200))
      throw new Error('La respuesta de Gemini no es un JSON válido')
    }

    // Validar estructura
    if (!result.filteredProducts || !Array.isArray(result.filteredProducts)) {
      throw new Error('La respuesta de Gemini no tiene la estructura correcta')
    }

    console.log('✅ Reporte generado exitosamente por Gemini:')
    console.log('� Productos filtrados:', result.filteredProducts.length)
    console.log('📋 Título:', result.reportTitle)
    console.log('🎯 Criterios:', result.criteria)

    return {
      filteredProducts: result.filteredProducts,
      reportTitle: result.reportTitle || 'Reporte Personalizado',
      reportDescription: result.reportDescription || 'Reporte generado con IA',
      criteria: result.criteria || ['Filtrado con IA']
    }

  } catch (error) {
    console.error('❌ Error en generateReportWithGemini:', error)
    
    // Re-lanzar el error para que se maneje en el componente
    if (error instanceof Error) {
      throw error
    } else {
      throw new Error('Error desconocido al generar el reporte con IA')
    }
  }
}

// Función auxiliar para validar el formato de la consulta
export function validateQuery(query: string): string[] {
  const errors: string[] = []
  
  if (!query || query.trim().length < 5) {
    errors.push('La consulta debe tener al menos 5 caracteres')
  }
  
  if (query.length > 500) {
    errors.push('La consulta no puede exceder 500 caracteres')
  }
  
  return errors
}

// Función para generar sugerencias de consultas
export function getQuerySuggestions(): string[] {
  return [
    "Muéstrame todos los productos con stock bajo",
    "Dame los productos de la categoría electrónicos con más de 10 unidades",
    "Productos con precio mayor a $50000 ordenados por valor",
    "Todos los productos sin stock para reposición urgente",
    "Productos de oficina con stock entre 5 y 20 unidades",
    "Los 10 productos más caros del inventario",
    "Productos agregados en los últimos 30 días"
  ]
}