"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { testApiConnection, testBasicConnectivity } from "@/api/test-api"
import { API_CONFIG } from "@/api/config"

export default function DebugPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleTestBasic = async () => {
    setLoading(true)
    try {
      const result = await testBasicConnectivity()
      setResult({ type: 'basic', data: result })
    } finally {
      setLoading(false)
    }
  }

  const handleTestFull = async () => {
    setLoading(true)
    try {
      const result = await testApiConnection()
      setResult({ type: 'full', data: result })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Debug API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>URL Base:</strong> {API_CONFIG.BASE_URL}</p>
            <p><strong>Endpoint Inventario:</strong> {API_CONFIG.ENDPOINTS.INVENTARIO}</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleTestBasic} disabled={loading}>
              Probar Conectividad Básica
            </Button>
            <Button onClick={handleTestFull} disabled={loading}>
              Probar API Completa
            </Button>
          </div>

          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>
                  Resultado ({result.type})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
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