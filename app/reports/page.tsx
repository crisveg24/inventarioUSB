"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AppLayout } from "@/components/layout/app-layout"
import { BasicReports } from "@/components/reports/basic-reports"
import { AIChatModal } from "@/components/reports/ai-chat-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileBarChart, Bot } from "lucide-react"

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
                <p className="text-muted-foreground">Análisis y reportes de tu inventario</p>
              </div>
            </div>
          </div>

          {/* Basic Reports */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Reportes Básicos</h2>
            <BasicReports />
          </div>

          {/* AI Assistant Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bot className="h-5 w-5 text-primary" />
                Asistente IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                ¿Necesitas análisis personalizados o tienes preguntas específicas sobre tu inventario? Nuestro asistente
                de IA puede ayudarte con consultas avanzadas y recomendaciones.
              </p>
              <AIChatModal />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  )
}
