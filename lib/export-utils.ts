/**
 * Utilidades para exportar datos a diferentes formatos
 */

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { InventoryItem } from './inventory-data'

export interface ExportFilters {
  category?: string
  status?: string
  stockRange?: {
    min: number
    max: number
  }
  dateRange?: {
    from: Date
    to: Date
  }
  limit?: number
  offset?: number
}

export interface ExportOptions {
  filename?: string
  title?: string
  includeHeaders?: boolean
  filters?: ExportFilters
}

/**
 * Filtra los datos según los criterios especificados
 */
export function filterInventoryData(data: InventoryItem[], filters: ExportFilters): InventoryItem[] {
  let filteredData = [...data]

  // Filtrar por categoría
  if (filters.category && filters.category !== 'all') {
    filteredData = filteredData.filter(item => item.category === filters.category)
  }

  // Filtrar por estado
  if (filters.status && filters.status !== 'all') {
    filteredData = filteredData.filter(item => item.status === filters.status)
  }

  // Filtrar por rango de stock
  if (filters.stockRange) {
    filteredData = filteredData.filter(item => 
      item.quantity >= filters.stockRange!.min && 
      item.quantity <= filters.stockRange!.max
    )
  }

  // Filtrar por rango de fechas (basado en lastUpdated)
  if (filters.dateRange) {
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.lastUpdated)
      return itemDate >= filters.dateRange!.from && itemDate <= filters.dateRange!.to
    })
  }

  // Aplicar paginación
  if (filters.offset !== undefined) {
    filteredData = filteredData.slice(filters.offset)
  }

  if (filters.limit !== undefined) {
    filteredData = filteredData.slice(0, filters.limit)
  }

  return filteredData
}

/**
 * Prepara los datos para exportación con formato legible
 */
export function prepareDataForExport(data: InventoryItem[]) {
  return data.map(item => ({
    'ID': item.id,
    'Nombre del Producto': item.name,
    'Categoría': item.category,
    'Cantidad': item.quantity,
    'Stock Mínimo': item.minStock,
    'Precio': item.price,
    'Proveedor': item.supplier,
    'Estado': item.status === 'in-stock' ? 'En Stock' : 
             item.status === 'low-stock' ? 'Stock Bajo' : 'Sin Stock',
    'Valor Total': item.price * item.quantity,
    'Última Actualización': item.lastUpdated
  }))
}

/**
 * Exporta datos a Excel
 */
export function exportToExcel(data: InventoryItem[], options: ExportOptions = {}) {
  const {
    filename = 'reporte_inventario.xlsx',
    title = 'Reporte de Inventario',
    includeHeaders = true,
    filters = {}
  } = options

  // Filtrar datos
  const filteredData = filterInventoryData(data, filters)
  const exportData = prepareDataForExport(filteredData)

  // Crear workbook
  const wb = XLSX.utils.book_new()
  
  // Crear worksheet con los datos
  const ws = XLSX.utils.json_to_sheet(exportData, { 
    header: includeHeaders ? undefined : []
  })

  // Agregar título si se especifica
  if (title && includeHeaders) {
    XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' })
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: 'A2' }) // Línea vacía
    XLSX.utils.sheet_add_json(ws, exportData, { 
      origin: 'A3',
      skipHeader: false
    })
  }

  // Ajustar ancho de columnas
  const colWidths = [
    { wch: 15 }, // ID
    { wch: 30 }, // Nombre
    { wch: 20 }, // Categoría
    { wch: 10 }, // Cantidad
    { wch: 15 }, // Stock Mínimo
    { wch: 15 }, // Precio
    { wch: 25 }, // Proveedor
    { wch: 15 }, // Estado
    { wch: 15 }, // Valor Total
    { wch: 20 }  // Última Actualización
  ]
  ws['!cols'] = colWidths

  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario')

  // Generar y descargar archivo
  XLSX.writeFile(wb, filename)

  return {
    success: true,
    message: `Archivo Excel generado: ${filename}`,
    recordCount: filteredData.length
  }
}

/**
 * Exporta datos a PDF
 */
export function exportToPDF(data: InventoryItem[], options: ExportOptions = {}) {
  const {
    filename = 'reporte_inventario.pdf',
    title = 'Reporte de Inventario',
    filters = {}
  } = options

  // Filtrar datos
  const filteredData = filterInventoryData(data, filters)
  const exportData = prepareDataForExport(filteredData)

  // Crear documento PDF
  const doc = new jsPDF('landscape', 'mm', 'a4')

  // Configuración del documento
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(title, 20, 20)

  // Información del reporte
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 30)
  doc.text(`Total de registros: ${filteredData.length}`, 20, 35)

  // Agregar filtros aplicados
  let yPosition = 40
  if (filters.category && filters.category !== 'all') {
    doc.text(`Categoría: ${filters.category}`, 20, yPosition)
    yPosition += 5
  }
  if (filters.status && filters.status !== 'all') {
    doc.text(`Estado: ${filters.status}`, 20, yPosition)
    yPosition += 5
  }

  // Preparar datos para la tabla
  const tableData = exportData.map(item => [
    item.ID,
    item['Nombre del Producto'],
    item['Categoría'],
    item.Cantidad.toString(),
    `$${item.Precio.toLocaleString()}`,
    item.Estado,
    `$${item['Valor Total'].toLocaleString()}`
  ])

  const headers = [
    'ID',
    'Producto',
    'Categoría', 
    'Cantidad',
    'Precio',
    'Estado',
    'Valor Total'
  ]

  // Crear tabla
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPosition + 10,
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [59, 130, 246], // Azul
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Gris claro
    },
    columnStyles: {
      0: { cellWidth: 25 }, // ID
      1: { cellWidth: 50 }, // Producto
      2: { cellWidth: 30 }, // Categoría
      3: { cellWidth: 20, halign: 'center' }, // Cantidad
      4: { cellWidth: 25, halign: 'right' }, // Precio
      5: { cellWidth: 25, halign: 'center' }, // Estado
      6: { cellWidth: 30, halign: 'right' }  // Valor Total
    },
    margin: { left: 20, right: 20 }
  })

  // Agregar pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width - 40,
      doc.internal.pageSize.height - 10
    )
  }

  // Guardar archivo
  doc.save(filename)

  return {
    success: true,
    message: `Archivo PDF generado: ${filename}`,
    recordCount: filteredData.length
  }
}

/**
 * Genera reporte de resumen ejecutivo
 */
export function generateSummaryReport(data: InventoryItem[]) {
  const totalItems = data.length
  const totalValue = data.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const lowStockItems = data.filter(item => item.status === 'low-stock').length
  const outOfStockItems = data.filter(item => item.status === 'out-of-stock').length

  // Agrupar por categorías
  const categorySummary = data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = {
        count: 0,
        value: 0,
        lowStock: 0
      }
    }
    acc[item.category].count++
    acc[item.category].value += item.price * item.quantity
    if (item.status === 'low-stock' || item.status === 'out-of-stock') {
      acc[item.category].lowStock++
    }
    return acc
  }, {} as Record<string, { count: number; value: number; lowStock: number }>)

  return {
    totalItems,
    totalValue,
    lowStockItems,
    outOfStockItems,
    averageItemValue: totalValue / totalItems,
    categorySummary,
    generatedAt: new Date().toISOString()
  }
}