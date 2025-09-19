/**
 * Utilidades para exportar datos a diferentes formatos
 */

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InventarioActivoOut } from "@/api/types/inventario";

export interface ExportFilters {
  tipoActivo?: string;
  proceso?: string;
  criticidad?: string;
  confidencialidad?: string;
  disponibilidad?: string;
  integridad?: string;
  limit?: number;
  offset?: number;
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  includeHeaders?: boolean;
  filters?: ExportFilters;
}

/**
 * Filtra los datos según los criterios especificados
 */
export function filterInventoryData(
  data: InventarioActivoOut[],
  filters: ExportFilters
): InventarioActivoOut[] {
  let filteredData = [...data];

  // Filtrar por tipo de activo
  if (filters.tipoActivo && filters.tipoActivo !== "all") {
    filteredData = filteredData.filter(
      (item) => item.TIPO_DE_ACTIVO === filters.tipoActivo
    );
  }

  // Filtrar por proceso
  if (filters.proceso && filters.proceso !== "all") {
    filteredData = filteredData.filter(
      (item) => item.PROCESO === filters.proceso
    );
  }

  // Filtrar por criticidad
  if (filters.criticidad && filters.criticidad !== "all") {
    filteredData = filteredData.filter((item) =>
      item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes(
        filters.criticidad!.toLowerCase()
      )
    );
  }

  // Filtrar por confidencialidad
  if (filters.confidencialidad && filters.confidencialidad !== "all") {
    filteredData = filteredData.filter((item) =>
      item.CONFIDENCIALIDAD?.toLowerCase().includes(
        filters.confidencialidad!.toLowerCase()
      )
    );
  }

  // Filtrar por disponibilidad
  if (filters.disponibilidad && filters.disponibilidad !== "all") {
    filteredData = filteredData.filter((item) =>
      item.DISPONIBILIDAD?.toLowerCase().includes(
        filters.disponibilidad!.toLowerCase()
      )
    );
  }

  // Filtrar por integridad
  if (filters.integridad && filters.integridad !== "all") {
    filteredData = filteredData.filter((item) =>
      item.INTEGRIDAD?.toLowerCase().includes(filters.integridad!.toLowerCase())
    );
  }

  // Aplicar paginación
  if (filters.offset !== undefined) {
    filteredData = filteredData.slice(filters.offset);
  }

  if (filters.limit !== undefined) {
    filteredData = filteredData.slice(0, filters.limit);
  }

  return filteredData;
}

/**
 * Prepara los datos para exportación con formato legible
 */
export function prepareDataForExport(data: InventarioActivoOut[]) {
  return data.map((item) => ({
    ID: item.id,
    "Nombre del Activo": item.NOMBRE_DEL_ACTIVO,
    Descripción: item.DESCRIPCION,
    "Tipo de Activo": item.TIPO_DE_ACTIVO,
    "Medio de Conservación": item.MEDIO_DE_CONSERVACIÓN,
    Formato: item.FORMATO,
    Idioma: item.IDIOMA,
    Proceso: item.PROCESO,
    "Dueño del Activo": item.DUEÑO_DE_ACTIVO,
    "Tipo de Datos Personales": item.TIPO_DE_DATOS_PERSONALES,
    "Finalidad de la Recolección": item.FINALIDAD_DE_LA_RECOLECCIÓN,
    Confidencialidad: item.CONFIDENCIALIDAD,
    Integridad: item.INTEGRIDAD,
    Disponibilidad: item.DISPONIBILIDAD,
    "Criticidad Total": item.CRITICIDAD_TOTAL_DEL_ACTIVO,
    "Información Publicada": item.INFORMACIÓN_PUBLICADA_O_DISPONIBLE,
    "Lugar de Consulta": item.LUGAR_DE_CONSULTA,
  }));
}

/**
 * Exporta datos a Excel
 */
export function exportToExcel(
  data: InventarioActivoOut[],
  options: ExportOptions = {}
) {
  const {
    filename = "reporte_activos.xlsx",
    title = "Reporte de Activos de Información",
    includeHeaders = true,
    filters = {},
  } = options;

  // Filtrar datos
  const filteredData = filterInventoryData(data, filters);
  const exportData = prepareDataForExport(filteredData);

  // Crear workbook
  const wb = XLSX.utils.book_new();

  // Crear worksheet con los datos
  const ws = XLSX.utils.json_to_sheet(exportData, {
    header: includeHeaders ? undefined : [],
  });

  // Agregar título si se especifica
  if (title && includeHeaders) {
    XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: "A2" }); // Línea vacía
    XLSX.utils.sheet_add_json(ws, exportData, {
      origin: "A3",
      skipHeader: false,
    });
  }

  // Ajustar ancho de columnas para campos de activos
  const colWidths = [
    { wch: 10 }, // ID
    { wch: 30 }, // Nombre del Activo
    { wch: 40 }, // Descripción
    { wch: 20 }, // Tipo de Activo
    { wch: 25 }, // Medio de Conservación
    { wch: 15 }, // Formato
    { wch: 10 }, // Idioma
    { wch: 20 }, // Proceso
    { wch: 25 }, // Dueño del Activo
    { wch: 30 }, // Tipo de Datos Personales
    { wch: 35 }, // Finalidad de la Recolección
    { wch: 15 }, // Confidencialidad
    { wch: 15 }, // Integridad
    { wch: 15 }, // Disponibilidad
    { wch: 20 }, // Criticidad Total
    { wch: 25 }, // Información Publicada
    { wch: 30 }, // Lugar de Consulta
  ];
  ws["!cols"] = colWidths;

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, "Activos");

  // Generar y descargar archivo
  XLSX.writeFile(wb, filename);

  return {
    success: true,
    message: `Archivo Excel generado: ${filename}`,
    recordCount: filteredData.length,
  };
}

/**
 * Exporta datos a PDF
 */
export function exportToPDF(
  data: InventarioActivoOut[],
  options: ExportOptions = {}
) {
  const {
    filename = "reporte_activos.pdf",
    title = "Reporte de Activos de Información",
    filters = {},
  } = options;

  // Filtrar datos
  const filteredData = filterInventoryData(data, filters);
  const exportData = prepareDataForExport(filteredData);

  // Crear documento PDF
  const doc = new jsPDF("landscape", "mm", "a4");

  // Configuración del documento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 20, 20);

  // Información del reporte
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Fecha de generación: ${new Date().toLocaleDateString("es-ES")}`,
    20,
    30
  );
  doc.text(`Total de registros: ${filteredData.length}`, 20, 35);

  // Agregar filtros aplicados
  let yPosition = 40;
  if (filters.tipoActivo && filters.tipoActivo !== "all") {
    doc.text(`Tipo de Activo: ${filters.tipoActivo}`, 20, yPosition);
    yPosition += 5;
  }
  if (filters.proceso && filters.proceso !== "all") {
    doc.text(`Proceso: ${filters.proceso}`, 20, yPosition);
    yPosition += 5;
  }
  if (filters.criticidad && filters.criticidad !== "all") {
    doc.text(`Criticidad: ${filters.criticidad}`, 20, yPosition);
    yPosition += 5;
  }

  // Preparar datos para la tabla (campos principales)
  const tableData = exportData.map((item) => [
    item.ID,
    item["Nombre del Activo"] || "",
    item["Tipo de Activo"] || "",
    item["Proceso"] || "",
    item["Criticidad Total"] || "",
    item["Confidencialidad"] || "",
    item["Disponibilidad"] || "",
  ]);

  const headers = [
    "ID",
    "Nombre del Activo",
    "Tipo",
    "Proceso",
    "Criticidad",
    "Confidencialidad",
    "Disponibilidad",
  ];

  // Crear tabla
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPosition + 10,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Gris claro
    },
    columnStyles: {
      0: { cellWidth: 15 }, // ID
      1: { cellWidth: 60 }, // Nombre del Activo
      2: { cellWidth: 30 }, // Tipo
      3: { cellWidth: 30 }, // Proceso
      4: { cellWidth: 25 }, // Criticidad
      5: { cellWidth: 25 }, // Confidencialidad
      6: { cellWidth: 25 }, // Disponibilidad
    },
    margin: { left: 20, right: 20 },
  });

  // Agregar pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 40,
      doc.internal.pageSize.height - 10
    );
  }

  // Guardar archivo
  doc.save(filename);

  return {
    success: true,
    message: `Archivo PDF generado: ${filename}`,
    recordCount: filteredData.length,
  };
}

/**
 * Genera reporte de resumen ejecutivo
 */
export function generateSummaryReport(data: InventarioActivoOut[]) {
  const totalItems = data.length;

  // Contar por criticidad
  const criticalItems = data.filter(
    (item) =>
      item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes("alta") ||
      item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes("crítica")
  ).length;

  // Contar por confidencialidad
  const highConfidentialityItems = data.filter(
    (item) =>
      item.CONFIDENCIALIDAD?.toLowerCase().includes("alta") ||
      item.CONFIDENCIALIDAD?.toLowerCase().includes("confidencial")
  ).length;

  // Contar por disponibilidad baja
  const lowAvailabilityItems = data.filter(
    (item) =>
      item.DISPONIBILIDAD?.toLowerCase().includes("baja") ||
      item.DISPONIBILIDAD?.toLowerCase().includes("limitada")
  ).length;

  // Agrupar por tipo de activo
  const typeSummary = data.reduce((acc, item) => {
    const type = item.TIPO_DE_ACTIVO || "Sin tipo";
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        critical: 0,
        highConfidentiality: 0,
      };
    }
    acc[type].count++;
    if (
      item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes("alta") ||
      item.CRITICIDAD_TOTAL_DEL_ACTIVO?.toLowerCase().includes("crítica")
    ) {
      acc[type].critical++;
    }
    if (
      item.CONFIDENCIALIDAD?.toLowerCase().includes("alta") ||
      item.CONFIDENCIALIDAD?.toLowerCase().includes("confidencial")
    ) {
      acc[type].highConfidentiality++;
    }
    return acc;
  }, {} as Record<string, { count: number; critical: number; highConfidentiality: number }>);

  // Agrupar por proceso
  const processSummary = data.reduce((acc, item) => {
    const process = item.PROCESO || "Sin proceso";
    if (!acc[process]) {
      acc[process] = { count: 0 };
    }
    acc[process].count++;
    return acc;
  }, {} as Record<string, { count: number }>);

  return {
    totalItems,
    criticalItems,
    highConfidentialityItems,
    lowAvailabilityItems,
    typeSummary,
    processSummary,
    generatedAt: new Date().toISOString(),
  };
}
