"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, Send, User } from "lucide-react"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

export function AIChatModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Basándome en tu consulta sobre "${input}", puedo ayudarte con análisis de inventario. Aquí tienes algunas recomendaciones específicas para optimizar tu gestión de inventarios...`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Bot className="h-4 w-4 mr-2" />
          Consultar IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Bot className="h-5 w-5 text-primary" />
            Asistente IA de Inventarios
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[500px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                <p>¡Hola! Soy tu asistente de IA para inventarios.</p>
                <p className="text-sm">Pregúntame sobre análisis, optimización o cualquier duda sobre tu inventario.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"}`}>
                  <Card
                    className={`max-w-[80%] ${message.isUser ? "bg-primary text-primary-foreground" : "bg-card border-border"}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {!message.isUser && <Bot className="h-4 w-4 mt-0.5 text-primary" />}
                        {message.isUser && <User className="h-4 w-4 mt-0.5" />}
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Card className="bg-card border-border">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2 mt-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu consulta sobre inventarios..."
              className="flex-1 min-h-[60px] bg-background border-border text-foreground"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
