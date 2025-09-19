"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { BasicReports } from "@/components/reports/basic-reports"
import { AdvancedReports } from "@/components/reports/advanced-reports"
import { GeminiReportModal } from "@/components/reports/gemini-report-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileBarChart, Bot, Settings, Download } from "lucide-react"

export default function ReportsPage() {
  return (
    <AuthGuard>
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileBarChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
                <p className="text-muted-foreground">
                  Análisis y exportación de datos de tu inventario
                </p>
              </div>
            </div>
          </div>

          {/* Tabs for different report types */}
          <Tabs defaultValue="advanced" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Reportes Avanzados
              </TabsTrigger>
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                Reportes Básicos
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Asistente IA
              </TabsTrigger>
            </TabsList>

            {/* Advanced Reports Tab */}
            <TabsContent value="advanced" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">
                  Exportación Personalizada
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Genera reportes personalizados con filtros avanzados y exporta en formato Excel o PDF.
                Configura los filtros según tus necesidades específicas.
              </p>
              <AdvancedReports />
            </TabsContent>

            {/* Basic Reports Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <FileBarChart className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold text-foreground">
                  Reportes Predefinidos
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Accede a reportes estándar con análisis predefinidos de tu inventario.
              </p>
              <BasicReports />
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="ai" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Bot className="h-5 w-5 text-primary" />
                    Asistente de Reportes IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    ¿Necesitas análisis personalizados o tienes preguntas específicas sobre tu inventario? 
                    Nuestro asistente de IA puede ayudarte con consultas avanzadas y recomendaciones 
                    basadas en tus datos.
                  </p>
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Ejemplos de consultas:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Muéstrame todos los productos con stock bajo</li>
                      <li>Dame los productos de la categoría electrónicos</li>
                      <li>Productos con precio mayor a $50000</li>
                      <li>Todos los productos sin stock para reposición</li>
                    </ul>
                  </div>
                  <div className="pt-2">
                    <GeminiReportModal />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
