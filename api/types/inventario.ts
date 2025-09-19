/**
 * Tipos TypeScript para el API de Inventario de Activos
 * Basado en la documentación del API FastAPI
 */

// Tipo base para crear un activo (sin ID)
export interface InventarioActivoCreate {
  NOMBRE_DEL_ACTIVO?: string | null;
  DESCRIPCION?: string | null;
  TIPO_DE_ACTIVO?: string | null;
  MEDIO_DE_CONSERVACIÓN?: string | null;
  FORMATO?: string | null;
  IDIOMA?: string | null;
  PROCESO?: string | null;
  DUEÑO_DE_ACTIVO?: string | null;
  TIPO_DE_DATOS_PERSONALES?: string | null;
  FINALIDAD_DE_LA_RECOLECCIÓN?: string | null;
  CONFIDENCIALIDAD?: string | null;
  INTEGRIDAD?: string | null;
  DISPONIBILIDAD?: string | null;
  CRITICIDAD_TOTAL_DEL_ACTIVO?: string | null;
  INFORMACIÓN_PUBLICADA_O_DISPONIBLE?: string | null;
  LUGAR_DE_CONSULTA?: string | null;
}

// Tipo para actualizar un activo (sin ID, todos los campos opcionales)
export interface InventarioActivoUpdate extends InventarioActivoCreate {}

// Tipo completo del activo (con ID)
export interface InventarioActivoOut extends InventarioActivoCreate {
  id: number;
}

// Tipo para la respuesta de lista de activos
export type InventarioActivoList = InventarioActivoOut[];

// Tipo para errores de validación
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// Tipo para parámetros de consulta
export interface InventarioQueryParams {
  skip?: number;
  limit?: number;
}

// Tipo para respuestas de API
export interface ApiResponse<T> {
  data?: T;
  error?: string | HTTPValidationError;
  status: number;
}
