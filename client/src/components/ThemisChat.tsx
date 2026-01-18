"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Plus, Clock, Send, Search, Scale, FileText, Download, ExternalLink } from "lucide-react"
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
      content: "¡Hola! Soy Themis, tu asistente de inteligencia artificial.\n¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [frequentIntents, setFrequentIntents] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchFrequent = async () => {
    try {
      const res = await fetch(`${API_URL}/intents`)
      const data = await res.json()
      if (Array.isArray(data)) {
        const top5 = data
          .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
          .slice(0, 5)
        setFrequentIntents(top5)
      }
    } catch (err) {
      console.error("Error cargando historial", err)
    }
  }

  useEffect(() => {
    fetchFrequent()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleDownload = async (fileUrl: string) => {
    try {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`;
      const fileName = fileUrl.split('/').pop() || 'archivo';
      
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; 
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error en la descarga:", err);
      // Fallback: abrir en nueva pestaña si falla la descarga directa
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`;
      window.open(fullUrl, '_blank');
    }
  }

  const handleNewChat = () => {
    setMessages([{
      id: Date.now().toString(),
      content: "¡Hola! Soy Themis, tu asistente de inteligencia artificial.\n¿En qué puedo ayudarte hoy?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }])
  }

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputValue
    if (textToSend.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
    }

    setMessages(prev => [...prev, newUserMessage])
    setInputValue("")

    try {
      const botResponseData = await getBotResponse(textToSend)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponseData.text,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        file: botResponseData.file
      }
      setMessages(prev => [...prev, botMessage])
      fetchFrequent() 
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F5F5DC]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#722F37] text-white flex flex-col h-full flex-shrink-0">
        <Link href="/login" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
            <Scale className="w-6 h-6" />
          </div>
          <span className="text-xl font-semibold">Themis</span>
        </Link>

        <div className="px-4 pb-4">
          <Button 
            onClick={handleNewChat}
            className="w-full bg-[#F5F5DC] hover:bg-[#F5F5DC]/90 text-[#722F37] border border-[#722F37]/20 justify-start gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Chat
          </Button>
        </div>

        <div className="flex-1 border-t border-white/10 overflow-hidden flex flex-col">
          <div className="px-4 py-3 flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" />
            <span>Preguntas Frecuentes</span>
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 pb-4">
              {frequentIntents.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => handleSendMessage(intent.title)}
                  className="w-full text-left text-[11px] p-2 rounded hover:bg-white/10 transition-colors truncate block"
                >
                  • {intent.title}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        <header className="h-16 bg-white border-b border-gray-200 p-4 flex items-center gap-3 flex-shrink-0 z-10">
          <div className="w-10 h-10 rounded-full bg-[#722F37] flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-md font-semibold text-gray-900 leading-none">Themis Chatbot</h1>
            <p className="text-xs text-gray-500 mt-1">Asistente Institucional</p>
          </div>
        </header>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-[#722F37] flex items-center justify-center flex-shrink-0">
                    <Scale className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`flex flex-col ${message.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`rounded-2xl px-4 py-2.5 max-w-md shadow-sm ${message.sender === "user" ? "bg-[#722F37] text-white" : "bg-white text-gray-800 border border-gray-200"}`}>
                    
                    {/* MODIFICACIÓN AQUÍ: whitespace-pre-line para respetar saltos de línea */}
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {message.content}
                    </p>
                    
                    {message.file && (
                      <div className="mt-3 p-2 rounded-xl bg-gray-50 border border-gray-100">
                        {message.file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <div className="relative group mb-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <img 
                              src={message.file.startsWith('http') ? message.file : `${API_URL}${message.file}`} 
                              alt="Adjunto" 
                              className="max-h-48 w-full object-contain"
                            />
                            <a 
                              href={message.file.startsWith('http') ? message.file : `${API_URL}${message.file}`} 
                              target="_blank" 
                              className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 mb-2">
                            <FileText className="w-6 h-6 text-[#722F37]" />
                            <span className="text-[11px] font-medium text-gray-600 truncate max-w-[150px]">
                              Documento
                            </span>
                          </div>
                        )}

                        <button 
                          onClick={() => handleDownload(message.file!)}
                          className="flex items-center justify-center gap-2 w-full py-2 bg-[#722F37] rounded-lg text-white text-[11px] font-bold hover:bg-[#5a2529] transition-all shadow-md active:scale-95"
                        >
                          <Download className="w-3.5 h-3.5" />
                          DESCARGAR ARCHIVO
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{message.timestamp}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder="Escribe tu consulta..."
                className="pl-10 pr-4 py-5 rounded-full border-gray-200 focus:ring-[#722F37]"
              />
            </div>
            <Button onClick={() => handleSendMessage()} className="w-12 h-12 rounded-full bg-[#722F37] hover:bg-[#5a2529] text-white transition-all">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}