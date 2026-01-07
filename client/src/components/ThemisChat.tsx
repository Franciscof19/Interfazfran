"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, MessageSquare, Info, Clock, Send, Search, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getBotResponse } from "@/chatbotLogic"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
  file?: string
}

export default function ThemisChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "¡Hola! Soy Themis, tu asistente de inteligencia artificial. ¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }
  ])
  const [inputValue, setInputValue] = useState("")

  // Ref para scroll automático
const messagesEndRef = useRef<HTMLDivElement | null>(null)

// Cada vez que cambien los mensajes, baja al final
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}, [messages])


  // ✅ Ahora es async
  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue("")

    // ✅ Esperar respuesta del bot (estática + dinámica)
    try {
      const botResponseData = await getBotResponse(inputValue)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseData.text,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        file: botResponseData.file
      }
      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      console.error("Error obteniendo respuesta del bot:", err)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "⚠️ Error al conectar con el servidor de intenciones.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      }
      setMessages(prev => [...prev, botMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage()
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#722F37] text-white flex flex-col h-screen overflow-y-auto">
  
  {/* Logo con link a login (sin hover ni sombreado) */}
<Link href="/login" className="p-4 flex items-center gap-3">
  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
    <Scale className="w-6 h-6" />
  </div>
  <span className="text-xl font-semibold">Themis</span>
</Link>


  {/* Nuevo Chat Button */}
  <div className="px-4 pb-4">
    <Button 
      className="w-full bg-[#F5F5DC] hover:bg-[#F5F5DC]/90 text-[#722F37] border border-[#722F37]/20 justify-start gap-2"
      variant="ghost"
    >
      <Plus className="w-5 h-5" />
      Nuevo Chat
    </Button>
  </div>

  {/* Chat Actual Section */}
  <div className="px-4 py-3 border-t border-white/10">
    <div className="flex items-center gap-2 text-sm font-medium mb-2">
      <MessageSquare className="w-4 h-4" />
      <span>Chat Actual</span>
    </div>
  </div>

  {/* Acerca de Section */}
  <div className="px-4 py-3 border-t border-white/10">
    <div className="flex items-center gap-2 text-sm font-medium">
      <Info className="w-4 h-4" />
      <span>Acerca de</span>
    </div>
  </div>

  {/* Historial Section */}
  <div className="flex-1 border-t border-white/10 overflow-hidden flex flex-col">
    <div className="px-4 py-3 flex items-center gap-2 text-sm font-medium">
      <Clock className="w-4 h-4" />
      <span>Historial</span>
    </div>
    <ScrollArea className="flex-1 px-4">
      <div className="space-y-3 pb-4">
        <p className="text-sm text-white/60">Aquí irá tu historial dinámico</p>
      </div>
    </ScrollArea>
  </div>
</aside>


      {/* Main Chat Area */}
      <main className="flex-1 bg-[#F5F5DC] flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#722F37] flex items-center justify-center">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Themis Chatbot</h1>
            <p className="text-sm text-gray-600">Asistente de IA</p>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center flex-shrink-0">
                    <Scale className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`rounded-2xl px-5 py-3 max-w-2xl ${
                      message.sender === "user"
                        ? "bg-[#722F37] text-white"
                        : "bg-white text-gray-900 border border-gray-200"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">{message.content}</p>
                    {message.file && (
                      <a href={message.file} download className="text-sm text-blue-600 underline mt-2 block">
                        📎 Descargar archivo
                      </a>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {message.timestamp}
                  </span>
                </div>

                {message.sender === "user" && (
                  <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold">U</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
<div className="border-t border-gray-200 bg-white p-4 sticky bottom-0">
  <div className="max-w-4xl mx-auto">
    <div className="flex gap-3 items-center mb-2">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Escribe tu mensaje aquí..."
          className="pl-11 pr-4 py-6 text-base border-gray-300 rounded-full focus:ring-2 focus:ring-[#722F37] focus:border-transparent"
        />
      </div>
      <Button
        onClick={handleSendMessage}
        className="w-12 h-12 rounded-full bg-[#722F37] hover:bg-[#5a2529] text-white flex items-center justify-center flex-shrink-0"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
    <p className="text-xs text-center text-gray-500">
      Themis puede cometer errores. Considera verificar información importante.
    </p>
  </div>
</div>

      </main>
    </div>
  )
}
