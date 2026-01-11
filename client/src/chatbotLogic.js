// src/chatbotLogic.js

export const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "")
    .trim()
}

export const staticIntents = [
  {
    tag: "Saludo",
    keywords: ["hola", "saludos", "que tal", "buenos dias", "buenas tardes", "buenas noches"],
    responses: [
      "¡Hola! Soy Themis, tu asistente virtual. Vamos a hacer que tu experiencia sea más fácil y emocionante."
    ],
    file: null
  },
  {
    tag: "inscripcion",
    keywords: ["inscripcion","inscribo","inscribirme","inscribi","inscribirse","como me inscribo","pasos de inscripcion","planilla de inscripcion"],
    responses: ["Sigue los pasos para la inscripción."],
    file: "/docs/planilla-inscripcion.pdf"
  },
]

// --- Obtener intenciones dinámicas desde el backend ---
async function getDynamicIntents() {
  try {
    const token = localStorage.getItem("token") // 👈 solo leer
    const res = await fetch("http://localhost:4000/intents", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      }
    })
    const data = await res.json()
    console.log("📦 Respuesta cruda del backend:", data)

    const intentsArray = Array.isArray(data)
      ? data
      : data.intents || data.rows || []

    if (Array.isArray(intentsArray)) {
      const adapted = intentsArray.map((intent) => ({
        tag: intent.title,
        keywords: (intent.patterns || []).map(p => normalizeText(p)),
        responses: intent.responses?.length
          ? intent.responses
          : ["Respuesta no definida"],
        file: intent.files?.[0]?.path || null
      }))
      console.log("✅ Intenciones dinámicas cargadas:", adapted)
      return adapted
    }

    console.warn("⚠️ El backend no devolvió un array de intenciones")
    return []
  } catch (err) {
    console.error("❌ Error cargando intenciones dinámicas:", err)
    return []
  }
}


// --- Función para generar respuesta del bot ---
export async function getBotResponse(userMessage) {
  const normalized = normalizeText(userMessage)

  const dynamicIntents = await getDynamicIntents()
  const allIntents = [...staticIntents, ...dynamicIntents]

  for (let intent of allIntents) {
    for (let keyword of intent.keywords) {
      if (normalized.includes(keyword)) {
        const response = intent.responses[Math.floor(Math.random() * intent.responses.length)]
        return { text: response, file: intent.file || null }
      }
    }
  }

  return { text: "Lo siento, no entendí eso. ¿Puedes reformular tu pregunta?", file: null }
}
