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
        body: JSON.stringify({ username, password }) // 👈 ahora se envía username
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || "Error")
      localStorage.setItem("token", data.token)
      router.push("/admin")
    } catch {
      setError("No se pudo conectar")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC]">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold text-gray-900">Acceso</h1>
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
  )
}
