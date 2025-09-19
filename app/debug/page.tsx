"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { testApiConnection, testBasicConnectivity } from "@/api/test-api"
import { API_CONFIG } from "@/api/config"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Globe, Database } from "lucide-react"

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTestBasic = async () => {
    setLoading(true)
    try {
      const result = await testBasicConnectivity()
      setResult({ type: 'basic', data: result, timestamp: new Date().toLocaleTimeString() })
    } finally {
      setLoading(false)
    }
  }

  const handleTestFull = async () => {
    setLoading(true)
    try {
      const result = await testApiConnection()
      setResult({ type: 'full', data: result, timestamp: new Date().toLocaleTimeString() })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (success: boolean, errorType?: string) => {
    if (success) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
        <CheckCircle className="w-3 h-3 mr-1" />
        Conectado
      </Badge>
    }
    
    const getErrorInfo = (type?: string) => {
      switch (type) {
        case 'timeout':
          return { color: 'yellow', text: 'Timeout', icon: AlertCircle }
        case 'cors':
          return { color: 'orange', text: 'Error CORS', icon: XCircle }
        case 'network':
          return { color: 'red', text: 'Error de Red', icon: XCircle }
        case 'connection_refused':
          return { color: 'red', text: 'Conexión Rechazada', icon: XCircle }
        default:
          return { color: 'red', text: 'Error', icon: XCircle }
      }
    }
    
    const errorInfo = getErrorInfo(errorType)
    const Icon = errorInfo.icon
    
    return <Badge className={`bg-${errorInfo.color}-500/10 text-${errorInfo.color}-500 border-${errorInfo.color}-500/20`}>
      <Icon className="w-3 h-3 mr-1" />
      {errorInfo.text}
    </Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            🧪 Diagnóstico de API - inventarioUSB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información de configuración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Configuración</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">URL Base (Desarrollo):</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/api/proxy
                    <span className="text-green-600 dark:text-green-400 ml-2">
                      (proxy local para evitar CORS)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">URL Externa:</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    https://inventoryapp.usbtopia.usbbog.edu.co
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Endpoint:</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {API_CONFIG.ENDPOINTS.INVENTARIO} 
                    <span className="text-green-600 dark:text-green-400 ml-2">
                      (proxied en desarrollo)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">URL Completa:</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/api/proxy?endpoint={API_CONFIG.ENDPOINTS.INVENTARIO}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Estado de Conexión</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Estado:</span>
                      {getStatusBadge(result.data.success, result.data.errorType)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Última prueba:</span>
                      <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                    </div>
                    {result.data.status && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">HTTP Status:</span>
                        <Badge variant="outline">{result.data.status}</Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No se han ejecutado pruebas aún</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Botones de prueba */}
          <div className="flex gap-3">
            <Button onClick={handleTestBasic} disabled={loading} variant="outline">
              <Globe className="w-4 h-4 mr-2" />
              {loading && result?.type === 'basic' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Probando...
                </>
              ) : (
                'Probar Conectividad'
              )}
            </Button>
            <Button onClick={handleTestFull} disabled={loading}>
              <Database className="w-4 h-4 mr-2" />
              {loading && result?.type === 'full' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Probando...
                </>
              ) : (
                'Probar API Completa'
              )}
            </Button>
          </div>

          {/* Alertas informativas */}
          <div className="space-y-3">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Modo Desarrollo:</strong> Si la API no está disponible, la aplicación 
                automáticamente usará datos de demostración para que puedas seguir trabajando.
              </AlertDescription>
            </Alert>

            {result && !result.data.success && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error detectado:</strong> {result.data.error || result.data.statusText}
                  {result.data.errorType === 'cors' && (
                    <div className="mt-2 text-sm">
                      💡 <strong>Sugerencia:</strong> Verifica que el servidor tenga CORS habilitado 
                      para el origen: {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}
                    </div>
                  )}
                  {result.data.errorType === 'invalid_redirect' && (
                    <div className="mt-2 text-sm space-y-1">
                      💡 <strong>Problema común:</strong> El servidor está redirigiendo en la solicitud OPTIONS (preflight).
                      <br />
                      🔧 <strong>Posibles soluciones:</strong>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        <li>Verificar que la URL no tenga problemas con barras finales</li>
                        <li>Asegurar que no hay redirects HTTP → HTTPS en el preflight</li>
                        <li>Contactar al administrador del servidor para revisar la configuración CORS</li>
                      </ul>
                    </div>
                  )}
                  {result.data.errorType === 'timeout' && (
                    <div className="mt-2 text-sm">
                      ⏱️ <strong>Sugerencia:</strong> El servidor puede estar sobrecargado. 
                      Intenta nuevamente en unos momentos.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Resultado detallado */}
          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Resultado Detallado ({result.type})</span>
                  <Badge variant="outline">{result.timestamp}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}