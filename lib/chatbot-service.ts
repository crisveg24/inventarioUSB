// Servicio de IA especializado para el chatbot flotante
// Maneja diferentes tipos de consultas: Crear, Editar, Eliminar, Consultar

export type ChatbotAction = "crear" | "editar" | "eliminar" | "consultar";

export interface ChatbotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  action?: ChatbotAction;
}

export interface ChatbotCreateRequest {
  action: "crear";
  query: string;
}

export interface ChatbotEditRequest {
  action: "editar";
  query: string;
  inventoryData: any[];
}

export interface ChatbotDeleteRequest {
  action: "eliminar";
  query: string;
  inventoryData: any[];
}

export interface ChatbotConsultRequest {
  action: "consultar";
  query: string;
  inventoryData: any[];
}

export interface ChatbotJsonResponse {
  action: string;
  data: any;
  instructions: string;
}

export interface ChatbotHumanResponse {
  message: string;
  type: "info" | "success" | "warning" | "error";
}

const GEMINI_API_KEY = "AIzaSyBfevJcvq62SnaXd-K8yfuSY92SlbyHEXo";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

// Prompts especializados para cada acción
const createPrompt = (query: string) => `
ACCIÓN: CREAR PRODUCTO
CONSULTA DEL USUARIO: "${query}"

TAREA: Extraer los datos del producto que el usuario quiere crear y devolver un JSON completo para la API.

RESPONDE ÚNICAMENTE con este JSON exacto:
{
  "action": "crear",
  "data": {
    "NOMBRE_DEL_ACTIVO": "nombre del producto extraído",
    "TIPO_DE_ACTIVO": "tipo extraído o 'Activo de información'",
    "PROCESO": "proceso extraído o 'General'",
    "DUEÑO_DE_ACTIVO": "dueño extraído o 'No especificado'",
    "DESCRIPCION": "descripción extraída o generada",
    "CONFIDENCIALIDAD": "Bajo|Medio|Alto (por defecto Bajo)",
    "DISPONIBILIDAD": "Bajo|Medio|Alto (por defecto Medio)",
    "INTEGRIDAD": "Bajo|Medio|Alto (por defecto Medio)",
    "CRITICIDAD_TOTAL_DEL_ACTIVO": "Bajo|Medio|Alto (por defecto Bajo)",
    "FORMATO": "formato extraído o 'Digital'",
    "MEDIO_DE_CONSERVACIÓN": "Digital|Físico|Híbrido (por defecto Digital)",
    "IDIOMA": "Español"
  },
  "instructions": "Descripción de lo que se va a crear"
}

EJEMPLO:
Usuario: "Quiero crear un activo laptop Dell para el proceso de TI con alta criticidad"
Respuesta: {"action":"crear","data":{"NOMBRE_DEL_ACTIVO":"laptop Dell","TIPO_DE_ACTIVO":"Activo físico","PROCESO":"TI","DUEÑO_DE_ACTIVO":"No especificado","DESCRIPCION":"Laptop Dell para uso empresarial","CONFIDENCIALIDAD":"Medio","DISPONIBILIDAD":"Alto","INTEGRIDAD":"Medio","CRITICIDAD_TOTAL_DEL_ACTIVO":"Alto","FORMATO":"Físico","MEDIO_DE_CONSERVACIÓN":"Físico"},"instructions":"Se creará un activo laptop Dell con alta criticidad"}
`;

const editPrompt = (query: string, inventoryData: any[]) => `
ACCIÓN: EDITAR PRODUCTO
CONSULTA DEL USUARIO: "${query}"

INVENTARIO COMPLETO (${inventoryData.length} activos):
${inventoryData
  .slice(0, 30)
  .map(
    (item) =>
      `- ID: ${item.id}, Nombre: "${item.NOMBRE_DEL_ACTIVO || "Sin nombre"}"
  * Tipo: ${item.TIPO_DE_ACTIVO || "Sin tipo"}
  * Proceso: ${item.PROCESO || "Sin proceso"}
  * Dueño: ${item.DUEÑO_DE_ACTIVO || "Sin dueño"}
  * Criticidad: ${item.CRITICIDAD_TOTAL_DEL_ACTIVO || "Sin datos"}
  * Confidencialidad: ${item.CONFIDENCIALIDAD || "Sin datos"}
  * Disponibilidad: ${item.DISPONIBILIDAD || "Sin datos"}
  * Integridad: ${item.INTEGRIDAD || "Sin datos"}
  * Formato: ${item.FORMATO || "Sin formato"}
  * Medio: ${item.MEDIO_DE_CONSERVACIÓN || "Sin datos"}
  * Descripción: ${item.DESCRIPCION || "Sin descripción"}`
  )
  .join("\n\n")}

TAREA: Identificar qué producto quiere editar y qué cambios hacer.

RESPONDE ÚNICAMENTE con este JSON exacto:
{
  "action": "editar",
  "data": {
    "id": "id_del_producto_a_editar",
    "changes": {
      "NOMBRE_DEL_ACTIVO": "nuevo_nombre_si_aplica",
      "TIPO_DE_ACTIVO": "nuevo_tipo_si_aplica",
      "PROCESO": "nuevo_proceso_si_aplica",
      "DUEÑO_DE_ACTIVO": "nuevo_dueño_si_aplica",
      "DESCRIPCION": "nueva_descripcion_si_aplica",
      "CONFIDENCIALIDAD": "nueva_confidencialidad_si_aplica",
      "DISPONIBILIDAD": "nueva_disponibilidad_si_aplica",
      "INTEGRIDAD": "nueva_integridad_si_aplica",
      "CRITICIDAD_TOTAL_DEL_ACTIVO": "nueva_criticidad_si_aplica",
      "FORMATO": "nuevo_formato_si_aplica",
      "MEDIO_DE_CONSERVACIÓN": "nuevo_medio_si_aplica"
    }
  },
  "instructions": "Descripción de los cambios a realizar"
}

EJEMPLO:
Usuario: "Cambiar la criticidad de Bienes y activos físicos a Alto"
Buscar producto con nombre "Bienes y activos físicos", encontrar su ID y devolver JSON con los cambios.
`;

const deletePrompt = (query: string, inventoryData: any[]) => `
ACCIÓN: ELIMINAR PRODUCTO
CONSULTA DEL USUARIO: "${query}"

INVENTARIO COMPLETO (${inventoryData.length} activos):
${inventoryData
  .slice(0, 50)
  .map(
    (item) =>
      `- ID: ${item.id}, Nombre: "${item.NOMBRE_DEL_ACTIVO || "Sin nombre"}"
  * Tipo: ${item.TIPO_DE_ACTIVO || "Sin tipo"}
  * Proceso: ${item.PROCESO || "Sin proceso"}
  * Dueño: ${item.DUEÑO_DE_ACTIVO || "Sin dueño"}
  * Descripción: ${item.DESCRIPCION || "Sin descripción"}`
  )
  .join("\n\n")}

TAREA: Identificar qué producto(s) el usuario quiere eliminar por nombre, tipo, proceso, etc.

RESPONDE ÚNICAMENTE con este JSON exacto:
{
  "action": "eliminar",
  "data": {
    "id": "id_del_producto_a_eliminar",
    "name": "nombre_del_producto_encontrado"
  },
  "instructions": "Confirmación de eliminación"
}

EJEMPLO:
Usuario: "Eliminar el activo Bienes y activos físicos"
Buscar activo con nombre "Bienes y activos físicos", encontrar su ID y devolver JSON.
`;

const consultPrompt = (query: string, inventoryData: any[]) => `
ACCIÓN: CONSULTAR INFORMACIÓN
CONSULTA DEL USUARIO: "${query}"

INVENTARIO COMPLETO (${inventoryData.length} activos):
${inventoryData
  .slice(0, 50)
  .map(
    (item) =>
      `- ID: ${item.id}
  * Nombre: "${item.NOMBRE_DEL_ACTIVO || "Sin nombre"}"
  * Tipo: ${item.TIPO_DE_ACTIVO || "Sin tipo"}
  * Proceso: ${item.PROCESO || "Sin proceso"}
  * Dueño: ${item.DUEÑO_DE_ACTIVO || "Sin dueño"}
  * Criticidad: ${item.CRITICIDAD_TOTAL_DEL_ACTIVO || "Sin datos"}
  * Confidencialidad: ${item.CONFIDENCIALIDAD || "Sin datos"}
  * Disponibilidad: ${item.DISPONIBILIDAD || "Sin datos"}
  * Integridad: ${item.INTEGRIDAD || "Sin datos"}
  * Formato: ${item.FORMATO || "Sin formato"}
  * Medio Conservación: ${item.MEDIO_DE_CONSERVACIÓN || "Sin datos"}
  * Descripción: ${item.DESCRIPCION || "Sin descripción"}
  * Idioma: ${item.IDIOMA || "Sin idioma"}
  * Tipo Datos Personales: ${item.TIPO_DE_DATOS_PERSONALES || "Sin datos"}
  * Finalidad Recolección: ${item.FINALIDAD_DE_LA_RECOLECCIÓN || "Sin datos"}
  * Info Publicada: ${item.INFORMACIÓN_PUBLICADA_O_DISPONIBLE || "Sin datos"}
  * Lugar Consulta: ${item.LUGAR_DE_CONSULTA || "Sin datos"}`
  )
  .join("\n\n")}

TAREA: Analizar la consulta y responder de forma humana, clara y CONCISA (máximo 500 caracteres).

RESPONDE ÚNICAMENTE con este JSON exacto:
{
  "message": "Respuesta clara y concisa a la consulta del usuario. Incluye números específicos pero mantén el texto breve.",
  "type": "info"
}

EJEMPLOS:
- "criticidad alta" → "Encontré X activos con criticidad alta: [nombres principales]"
- "activos confidenciales" → "Hay X activos confidenciales en el proceso Y"
- "disponibilidad alta" → "X activos tienen alta disponibilidad: [lista breve]"
- "formato digital" → "Hay X activos en formato digital distribuidos en Y procesos"
- "datos personales" → "X activos manejan datos personales del tipo Y"

IMPORTANTE: Respuesta máximo 500 caracteres, sé directo y específico.
`;

async function callGemini(prompt: string): Promise<string> {
  try {
    console.log(
      "🚀 GEMINI - Iniciando llamada con prompt:",
      prompt.length,
      "caracteres"
    );

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    console.log("📤 GEMINI - Enviando request body:", {
      promptLength: prompt.length,
      contentsParts: requestBody.contents[0].parts.length,
      config: requestBody.generationConfig,
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Error en API de Gemini: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No se recibió respuesta de Gemini");
    }

    return generatedText;
  } catch (error) {
    console.error("Error llamando a Gemini:", error);
    throw error;
  }
}

function extractJson(text: string): any {
  try {
    // Limpiar texto
    let cleanedText = text.trim();
    cleanedText = cleanedText.replace(/```json/g, "").replace(/```/g, "");

    // Buscar JSON
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("No se encontró JSON en la respuesta");
    }

    const jsonText = cleanedText.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error extrayendo JSON:", error);
    throw new Error("Respuesta inválida de la IA");
  }
}

// Funciones principales para cada acción
export async function handleCreateQuery(
  request: ChatbotCreateRequest
): Promise<ChatbotJsonResponse> {
  const prompt = createPrompt(request.query);
  const response = await callGemini(prompt);
  return extractJson(response);
}

export async function handleEditQuery(
  request: ChatbotEditRequest
): Promise<ChatbotJsonResponse> {
  console.log("✏️ EDITAR - Datos recibidos:", {
    query: request.query,
    inventoryCount: request.inventoryData.length,
    sampleData: request.inventoryData.slice(0, 3),
  });

  const prompt = editPrompt(request.query, request.inventoryData);
  console.log("📝 EDITAR - Prompt generado:", prompt.substring(0, 500) + "...");

  const response = await callGemini(prompt);
  console.log("🤖 EDITAR - Respuesta de Gemini:", response);

  return extractJson(response);
}

export async function handleDeleteQuery(
  request: ChatbotDeleteRequest
): Promise<ChatbotJsonResponse> {
  console.log("🗑️ ELIMINAR - Datos recibidos:", {
    query: request.query,
    inventoryCount: request.inventoryData.length,
    sampleData: request.inventoryData.slice(0, 3),
  });

  const prompt = deletePrompt(request.query, request.inventoryData);
  console.log(
    "📝 ELIMINAR - Prompt generado:",
    prompt.substring(0, 500) + "..."
  );

  const response = await callGemini(prompt);
  console.log("🤖 ELIMINAR - Respuesta de Gemini:", response);

  return extractJson(response);
}

export async function handleConsultQuery(
  request: ChatbotConsultRequest
): Promise<ChatbotHumanResponse> {
  console.log("🔍 CONSULTA - Datos recibidos:", {
    query: request.query,
    inventoryCount: request.inventoryData.length,
    sampleData: request.inventoryData.slice(0, 3),
  });

  const prompt = consultPrompt(request.query, request.inventoryData);
  console.log(
    "📝 CONSULTA - Prompt generado:",
    prompt.substring(0, 500) + "..."
  );

  const response = await callGemini(prompt);
  console.log("🤖 CONSULTA - Respuesta de Gemini:", response);

  return extractJson(response);
}

// Función principal que enruta según la acción
export async function processChatbotQuery(
  action: ChatbotAction,
  query: string,
  inventoryData: any[] = []
): Promise<ChatbotJsonResponse | ChatbotHumanResponse> {
  switch (action) {
    case "crear":
      return handleCreateQuery({ action, query });

    case "editar":
      return handleEditQuery({ action, query, inventoryData });

    case "eliminar":
      return handleDeleteQuery({ action, query, inventoryData });

    case "consultar":
      return handleConsultQuery({ action, query, inventoryData });

    default:
      throw new Error(`Acción no soportada: ${action}`);
  }
}
