"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error en login")
        return
      }

      // ✅ Guardar token en localStorage
      localStorage.setItem("token", data.token)

      // Redirigir al panel de administración
      router.push("/admin")
    } catch (err) {
      setError("No se pudo conectar con el servidor")
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col">
      {/* 👇 Botón en la esquina superior derecha */}
      <div className="flex justify-end p-4">
        <button
          className="bg-[#722F37]  hover:bg-green-700 text-white px-4 py-2 rounded"
          onClick={() => router.push("/")}
        >
          Ir al Chatbot
        </button>
      </div>

      {/* Formulario centrado */}
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-sm space-y-4">
          <h1 className="text-xl font-semibold text-gray-900">Acceso</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border rounded p-2"
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full border rounded p-2"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full bg-[#722F37] hover:bg-[#5a2529] text-white py-2 rounded"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

