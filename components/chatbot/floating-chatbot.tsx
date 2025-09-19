'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, X, Send, Plus, Edit, Trash2, Search } from 'lucide-react'
import { processChatbotQuery, ChatbotAction, ChatbotMessage, ChatbotJsonResponse, ChatbotHumanResponse } from '@/lib/chatbot-service'
import { executeChatbotAction } from '@/lib/chatbot-actions'
import { getInventarioActivos } from '@/api/get-inventario'
import { toast } from '@/hooks/use-toast'

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [currentAction, setCurrentAction] = useState<ChatbotAction | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inventoryData, setInventoryData] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mantener conversación hasta recargar página
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatbot-messages')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (error) {
        console.error('Error cargando mensajes:', error)
      }
    }
  }, [])

  // Guardar mensajes en localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatbot-messages', JSON.stringify(messages))
    }
  }, [messages])

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cargar datos de inventario cuando se necesiten
  const loadInventoryData = async () => {
    if (inventoryData.length === 0) {
      try {
        console.log('🔄 CHATBOT - Cargando datos de inventario...')
        const data = await getInventarioActivos({ limit: 1000 })
        console.log('✅ CHATBOT - Datos cargados:', {
          count: data.length,
          sample: data.slice(0, 2)
        })
        setInventoryData(data)
        return data
      } catch (error) {
        console.error('❌ CHATBOT - Error cargando inventario:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del inventario",
          variant: "destructive"
        })
        return []
      }
    }
    console.log('📋 CHATBOT - Usando datos en cache:', inventoryData.length)
    return inventoryData
  }

  const addMessage = (message: Omit<ChatbotMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatbotMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      // Truncar mensajes muy largos
      content: message.content.length > 1000 
        ? message.content.substring(0, 1000) + '\n\n... [Respuesta truncada por ser muy larga]'
        : message.content
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleActionSelect = (action: ChatbotAction) => {
    setCurrentAction(action)
    
    // Mensaje del sistema explicando la acción seleccionada
    const actionMessages = {
      crear: "¿Qué producto quieres crear? Dime el nombre, cantidad, stock mínimo, precio y categoría.",
      editar: "¿Qué producto quieres editar? Dime el nombre del producto y qué cambios quieres hacer.",
      eliminar: "¿Qué producto quieres eliminar? Dime el nombre del producto.",
      consultar: "¿Qué información necesitas? Puedes preguntarme sobre stock, productos, categorías, etc."
    }

    addMessage({
      role: 'system',
      content: actionMessages[action],
      action
    })
  }

  const resetChat = () => {
    setCurrentAction(null)
    addMessage({
      role: 'system',
      content: "¿Qué quieres hacer? Selecciona una opción:"
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !currentAction || isLoading) return

    // Agregar mensaje del usuario
    addMessage({
      role: 'user',
      content: inputValue,
      action: currentAction
    })

    setIsLoading(true)
    const userQuery = inputValue
    setInputValue('')

    try {
      // Cargar inventario si es necesario - ESPERAR a que termine
      let inventory: any[] = []
      
      if (['editar', 'eliminar', 'consultar'].includes(currentAction)) {
        console.log('📋 CHATBOT - Cargando inventario para acción:', currentAction)
        inventory = await loadInventoryData()
        console.log('✅ CHATBOT - Inventario cargado exitosamente:', inventory.length, 'productos')
      }

      console.log('📊 CHATBOT - Datos de inventario para IA:', {
        action: currentAction,
        inventoryLoaded: inventory.length,
        query: userQuery,
        sampleData: inventory.slice(0, 2)
      })

      // AHORA SÍ procesar con IA (después de cargar datos)
      console.log('🤖 CHATBOT - Enviando a IA...')
      const response = await processChatbotQuery(currentAction, userQuery, inventory)

      if ('message' in response) {
        // Respuesta de consulta (humana)
        addMessage({
          role: 'assistant',
          content: response.message,
          action: currentAction
        })
      } else {
        // Respuesta de acción (JSON)
        const jsonResponse = response as ChatbotJsonResponse
        
        addMessage({
          role: 'assistant',
          content: `✅ ${jsonResponse.instructions}`,
          action: currentAction
        })

        // Aquí iría la llamada a la API correspondiente
        await executeAction(jsonResponse)
      }

    } catch (error) {
      console.error('Error procesando consulta:', error)
      addMessage({
        role: 'assistant',
        content: "❌ Lo siento, hubo un error procesando tu solicitud. ¿Puedes intentar de nuevo?",
        action: currentAction
      })
    } finally {
      setIsLoading(false)
    }
  }

  const executeAction = async (response: ChatbotJsonResponse) => {
    try {
      await executeChatbotAction(response)
      
      // Mensajes específicos según la acción
      const successMessages = {
        crear: `✅ Activo "${response.data.NOMBRE_DEL_ACTIVO}" creado exitosamente`,
        editar: `✅ Activo actualizado correctamente`,
        eliminar: `✅ Activo "${response.data.name}" eliminado`
      }
      
      toast({
        title: "Acción completada",
        description: successMessages[response.action as keyof typeof successMessages],
      })
      
      // Limpiar cache de inventario para recargar datos
      setInventoryData([])
      
    } catch (error) {
      console.error('Error ejecutando acción:', error)
      toast({
        title: "Error",
        description: "No se pudo completar la acción",
        variant: "destructive"
      })
    }
  }

  const openChat = () => {
    setIsOpen(true)
    
    // Si no hay mensajes, mostrar opciones iniciales
    if (messages.length === 0) {
      addMessage({
        role: 'system',
        content: "¡Hola! Soy tu asistente de inventario. ¿Qué quieres hacer?"
      })
    }
  }

  const ActionButtons = () => (
    <div className="grid grid-cols-2 gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionSelect('crear')}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Crear
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionSelect('editar')}
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        Editar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionSelect('eliminar')}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleActionSelect('consultar')}
        className="flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        Consultar
      </Button>
    </div>
  )

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <Button
          onClick={openChat}
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg">Asistente IA</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMessages([])
                  setCurrentAction(null)
                  localStorage.removeItem('chatbot-messages')
                  addMessage({
                    role: 'system',
                    content: "Chat reiniciado. ¡Hola! ¿Qué quieres hacer?"
                  })
                }}
                className="h-8 w-8 p-0"
                title="Limpiar chat"
              >
                🗑️
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-4 pt-0">
            {/* Mensajes */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.role === 'system'
                        ? 'bg-gray-100 text-gray-700 border'
                        : 'bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="chatbot-message whitespace-pre-wrap break-words max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {message.content}
                    </div>
                    {message.action && (
                      <Badge variant="secondary" className="ml-2 text-xs mt-2">
                        {message.action}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Mostrar botones de acción cuando es necesario */}
              {!currentAction && messages.length > 0 && (
                <div className="flex justify-center">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <ActionButtons />
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-2 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      Pensando...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input y controles */}
            <div className="space-y-2">
              {currentAction && (
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Modo: {currentAction}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetChat}
                    className="text-xs"
                  >
                    Cambiar acción
                  </Button>
                </div>
              )}
              
              {currentAction && (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={`¿Qué quieres ${currentAction}?`}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
