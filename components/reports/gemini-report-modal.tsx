"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  Sparkles, 
  Send, 
  Loader2, 
  FileText, 
  Download, 
  AlertCircle, 
  Lightbulb,
  CheckCircle,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getInventarioActivos } from "@/api"
import { mapApiActivoToInventoryItem } from "@/lib/api-mapping"
import { generateReportWithGemini, validateQuery, getQuerySuggestions, type GeminiReportResponse } from "@/lib/gemini-service"
import { exportGeminiDataToExcel, exportGeminiDataToPDF } from "@/lib/export-utils"
import type { InventoryItem } from "@/lib/inventory-data"

interface GeminiReportModalProps {
  // Ya no necesitamos inventoryData como prop porque lo obtenemos directamente del endpoint
}

export function GeminiReportModal({}: GeminiReportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportResult, setReportResult] = useState<GeminiReportResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const { toast } = useToast()

  const suggestions = getQuerySuggestions()

  const handleGenerateReport = async () => {
    console.log('🔄 INICIANDO GENERACIÓN DE REPORTE CON IA')
    console.log('📝 Query usuario:', query)
    
    // Validar consulta
    const validationErrors = validateQuery(query)
    if (validationErrors.length > 0) {
      console.error('❌ Error de validación:', validationErrors[0])
      setError(validationErrors[0])
      return
    }

    setIsGenerating(true)
    setError(null)
    setReportResult(null)

    try {
      // PASO 1: Obtener TODOS los productos del endpoint
      console.log('� PASO 1: Obteniendo productos del endpoint...')
      const activosData = await getInventarioActivos({ limit: 1000 }) // Obtener hasta 1000 productos
      console.log('✅ Productos obtenidos del endpoint:', activosData.length)
      
      // PASO 2: Mapear los datos al formato esperado
      console.log('🔄 PASO 2: Mapeando datos de API...')
      const mappedProducts = activosData.map(mapApiActivoToInventoryItem)
      console.log('✅ Productos mapeados:', mappedProducts.length)
      console.log('📊 Muestra de producto mapeado:', mappedProducts[0])
      
      // PASO 3: Enviar a Gemini
      console.log('🤖 PASO 3: Enviando a Gemini AI...')
      console.log('📤 Enviando:', { 
        query, 
        productosCount: mappedProducts.length 
      })
      
      const result = await generateReportWithGemini({
        query,
        inventoryData: mappedProducts
      })

      console.log('✅ RESULTADO OBTENIDO DE GEMINI:')
      console.log('📊 Productos filtrados:', result.filteredProducts.length)
      console.log('📋 Título:', result.reportTitle)
      console.log('🎯 Criterios:', result.criteria)

      setReportResult(result)
      
      toast({
        title: "Reporte generado con IA",
        description: `Se encontraron ${result.filteredProducts.length} productos`,
      })

    } catch (error) {
      console.error('❌ ERROR COMPLETO:', error)
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack available')
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(errorMessage)
      
      toast({
        title: "Error al generar reporte",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      console.log('🏁 Finalizando generación de reporte')
      setIsGenerating(false)
    }
  }

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!reportResult) return

    setIsExporting(format)
    
    try {
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `reporte_gemini_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`

      if (format === 'excel') {
        await exportGeminiDataToExcel(reportResult.filteredProducts, {
          filename,
          title: reportResult.reportTitle,
        })
      } else {
        await exportGeminiDataToPDF(reportResult.filteredProducts, {
          filename,
          title: reportResult.reportTitle,
        })
      }

      toast({
        title: "Exportación exitosa",
        description: `Reporte exportado como ${format.toUpperCase()}`,
      })

    } catch (error) {
      console.error('Error al exportar:', error)
      toast({
        title: "Error en la exportación",
        description: "No se pudo exportar el reporte",
        variant: "destructive"
      })
    } finally {
      setIsExporting(null)
    }
  }

  const handleUseSuggestion = (suggestion: string) => {
    setQuery(suggestion)
    setError(null)
  }

  const resetModal = () => {
    setQuery("")
    setReportResult(null)
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Bot className="h-4 w-4 mr-2" />
          Reporte con IA
          <Sparkles className="h-4 w-4 ml-2" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            Generar Reporte con Inteligencia Artificial
            <Sparkles className="h-4 w-4 text-blue-500" />
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Sección de consulta */}
          <div className="space-y-3">
            <Label htmlFor="query" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Describe el reporte que necesitas
            </Label>
            
            <Textarea
              id="query"
              placeholder="Ejemplo: Dame todos los productos con stock bajo de la categoría electrónicos..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setError(null)
              }}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />

            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Sugerencias:</span>
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseSuggestion(suggestion)}
                  disabled={isGenerating}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateReport}
              disabled={!query.trim() || isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Generar Reporte
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={resetModal}
              disabled={isGenerating}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>

          <Separator />

          {/* Sección de resultados */}
          {reportResult && (
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">{reportResult.reportTitle}</h3>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('excel')}
                    disabled={isExporting === 'excel'}
                  >
                    {isExporting === 'excel' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Excel
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting === 'pdf'}
                  >
                    {isExporting === 'pdf' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    PDF
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {reportResult.reportDescription}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Criterios aplicados:</span>
                      <div className="flex flex-wrap gap-1">
                        {reportResult.criteria.map((criterion, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {criterion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Productos encontrados:</span>
                      <Badge variant="default">
                        {reportResult.filteredProducts.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vista previa de productos */}
              {reportResult.filteredProducts.length > 0 && (
                <div className="flex-1 overflow-hidden">
                  <Label className="text-sm font-medium">Vista previa de productos:</Label>
                  <ScrollArea className="h-[200px] mt-2 border rounded-lg">
                    <div className="p-3 space-y-2">
                      {reportResult.filteredProducts.slice(0, 10).map((product, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-muted/50 rounded">
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.category} • {product.quantity} unidades
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              ${product.price?.toLocaleString()}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      
                      {reportResult.filteredProducts.length > 10 && (
                        <div className="text-center py-2 text-sm text-muted-foreground">
                          ... y {reportResult.filteredProducts.length - 10} productos más
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Información del servicio */}
          <div className="mt-auto">
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Este servicio utiliza Google Gemini AI para analizar tu consulta y filtrar productos. 
                Los datos se procesan de forma segura y no se almacenan.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}