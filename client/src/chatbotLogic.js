// src/chatbotLogic.js

export const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .trim()
}

// --- Intenciones estáticas ---
export const staticIntents = [
  {
    tag: "Saludo",
    keywords: ["hola", "saludos", "que tal", "buenos dias", "buenas tardes", "buenas noches"],
    response: "¡Hola! Soy Themis, tu asistente virtual. Vamos a hacer que tu experiencia sea más fácil y emocionante.",
    file: null
  },
  {
    tag: "inscripcion",
    keywords: ["inscripcion","inscribo","inscribirme","inscribi","inscribirse","como me inscribo","pasos de inscripcion","planilla de inscripcion"],
    response: "Sigue los pasos para la inscripción.",
    file: "/docs/planilla-inscripcion.pdf"
  },
  // ... el resto de tus intenciones estáticas
]

// --- Obtener intenciones dinámicas desde el backend ---
async function getDynamicIntents() {
  try {
    const res = await fetch("http://localhost:4000/intents")
    const data = await res.json()
    if (Array.isArray(data)) {
      // Adaptar formato para que coincida con staticIntents
      return data.map((intent) => ({
        tag: intent.title,
        keywords: intent.patterns || [],
        response: intent.responses?.[0] || "Respuesta no definida",
        file: intent.files?.[0]?.path || null
      }))
    }
    return []
  } catch (err) {
    console.error("Error cargando intenciones dinámicas:", err)
    return []
  }
}

// --- Función para generar respuesta del bot ---
export async function getBotResponse(userMessage) {
  const normalized = normalizeText(userMessage)

  // Combinar intenciones estáticas + dinámicas
  const dynamicIntents = await getDynamicIntents()
  const allIntents = [...staticIntents, ...dynamicIntents]

  for (let intent of allIntents) {
    for (let keyword of intent.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        return { text: intent.response, file: intent.file || null }
      }
    }
  }

  return { text: "Lo siento, no entendí eso. ¿Puedes reformular tu pregunta?", file: null }
}
