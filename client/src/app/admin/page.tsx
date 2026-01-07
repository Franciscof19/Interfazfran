"use client"

import { useEffect, useState } from "react"

// Ajusta estos endpoints si tus puertos son distintos
const INTENTS_API = "http://localhost:4000"
const POSTGREST_API = "http://localhost:3000"

interface Intent {
  id?: string
  title: string
  patterns: string[]
  responses: string[]
  files: { filename: string; path: string }[]
  faq: boolean
  updatedAt?: string
}

interface User {
  id?: string
  username: string
  password?: string
  role?: string
  lastLogin?: string
}

export default function AdminIntentsPage() {
  // Estados de intenciones
  const [intents, setIntents] = useState<Intent[]>([])
  const [form, setForm] = useState<Intent>({
    title: "",
    patterns: [],
    responses: [],
    files: [],
    faq: false
  })
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null)

  // Estados globales
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Estados de usuarios (PostgREST)
  const [users, setUsers] = useState<User[]>([])
  const [userForm, setUserForm] = useState<User>({
    username: "",
    password: "",
    role: ""
  })

  // Carga inicial de datos
  useEffect(() => {
    if (!token) {
      window.location.href = "/login"
      return
    }
    ;(async () => {
      try {
        // Intenciones (backend en 4000)
        const resIntents = await fetch(`${INTENTS_API}/intents`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const dataIntents = await resIntents.json()
        if (Array.isArray(dataIntents)) {
          setIntents(dataIntents)
        } else {
          setError(dataIntents.error || "No se pudieron cargar las intenciones")
        }

        // Usuarios (PostgREST en 3000)
        const resUsers = await fetch(`${POSTGREST_API}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const dataUsers = await resUsers.json()
        if (Array.isArray(dataUsers)) {
          setUsers(dataUsers)
        }
      } catch (err) {
        console.error("Error cargando datos:", err)
        setError("No se pudo conectar con el servidor")
      }
    })()
  }, [token])

  // Utilidades de intenciones
  const resetForm = () =>
    setForm({ title: "", patterns: [], responses: [], files: [], faq: false })

  const refreshList = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${INTENTS_API}/intents`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setIntents(data)
      } else {
        setError(data.error || "No se pudo actualizar el listado")
      }
    } catch {
      setError("No se pudo actualizar el listado")
    } finally {
      setLoading(false)
    }
  }

  const saveIntent = async () => {
    setError("")
    setLoading(true)
    try {
      const method = form.id ? "PUT" : "POST"
      const url = form.id
        ? `${INTENTS_API}/intents/${form.id}`
        : `${INTENTS_API}/intents`

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          patterns: form.patterns,
          responses: form.responses,
          faq: form.faq
        })
      })
      const data = await res.json()

      const intentId = data.id || form.id
      if (filesToUpload && intentId) {
        const fd = new FormData()
        Array.from(filesToUpload).forEach((f) => fd.append("files", f))
        await fetch(`${INTENTS_API}/intents/${intentId}/files`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        })
      }

      await refreshList()
      resetForm()
      setFilesToUpload(null)
    } catch {
      setError("No se pudo guardar la intención")
    } finally {
      setLoading(false)
    }
  }

  const editIntent = (i: Intent) => {
    setForm({
      id: i.id,
      title: i.title,
      patterns: i.patterns || [],
      responses: i.responses || [],
      files: i.files || [],
      faq: !!i.faq,
      updatedAt: i.updatedAt
    })
    setFilesToUpload(null)
  }

  const deleteIntent = async (id?: string) => {
    if (!id) return
    setLoading(true)
    try {
      await fetch(`${INTENTS_API}/intents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      await refreshList()
      if (form.id === id) resetForm()
    } catch {
      setError("No se pudo eliminar la intención")
    } finally {
      setLoading(false)
    }
  }

  const removeFile = async (id?: string, path?: string) => {
    if (!id || !path) return
    setLoading(true)
    try {
      await fetch(`${INTENTS_API}/intents/${id}/files`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ path })
      })
      await refreshList()
      const found = intents.find((x) => x.id === id)
      if (found) {
        setForm((prev) => ({
          ...prev,
          files: (found.files || []).filter((f) => f.path !== path)
        }))
      }
    } catch {
      setError("No se pudo eliminar el archivo")
    } finally {
      setLoading(false)
    }
  }

  // CRUD de usuarios con PostgREST
  const refreshUsers = async () => {
    try {
      const res = await fetch(`${POSTGREST_API}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Prefer: "count=exact"
        }
      })
      const data = await res.json()
      if (Array.isArray(data)) setUsers(data)
    } catch {
      setError("No se pudo cargar usuarios")
    }
  }

  const saveUser = async () => {
    setError("")
    setLoading(true)
    try {
      const isUpdate = !!userForm.id
      const method = isUpdate ? "PATCH" : "POST"
      const url = isUpdate
        ? `${POSTGREST_API}/users?id=eq.${userForm.id}`
        : `${POSTGREST_API}/users`

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Prefer: "return=representation" // devuelve el registro creado/actualizado
        },
        body: JSON.stringify({
          username: userForm.username,
          password: userForm.password,
          role: userForm.role
        })
      })

      // Opcional: usar la respuesta para actualizar sin refetch
      const returned = await res.json()
      if (Array.isArray(returned)) {
        // PostgREST puede devolver array de filas afectadas
        const updatedUser = returned[0]
        if (updatedUser) {
          if (isUpdate) {
            setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
          } else {
            setUsers((prev) => [updatedUser, ...prev])
          }
        } else {
          await refreshUsers()
        }
      } else {
        await refreshUsers()
      }

      setUserForm({ username: "", password: "", role: "" })
    } catch {
      setError("No se pudo guardar usuario")
    } finally {
      setLoading(false)
    }
  }

  const editUser = (u: User) => {
    setUserForm({ id: u.id, username: u.username, role: u.role || "" })
  }

  const deleteUser = async (id?: string) => {
    if (!id) return
    setLoading(true)
    try {
      await fetch(`${POSTGREST_API}/users?id=eq.${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      setError("No se pudo eliminar usuario")
    } finally {
      setLoading(false)
    }
  }

  const resetUserForm = () => setUserForm({ username: "", password: "", role: "" })

  return (
    <div className="min-h-screen bg-[#F5F5DC] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#3a161a] mb-4">Panel de intenciones</h1>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Izquierda: Formulario de Intención */}
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-5 space-y-4">
      <h2 className="text-lg font-semibold">Intención</h2>

      <label className="text-sm font-medium">Título</label>
      <input
        className="w-full border rounded p-2"
        placeholder="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />

      <label className="text-sm font-medium">Patrones (separados por coma)</label>
      <textarea
        className="w-full border rounded p-2"
        placeholder="hola, ayuda, cómo puedo..."
        value={form.patterns.join(", ")}
        onChange={(e) =>
          setForm({
            ...form,
            patterns: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
          })
        }
      />

      <label className="text-sm font-medium">Respuestas (separadas por coma)</label>
      <textarea
        className="w-full border rounded p-2"
        placeholder="Respuesta 1, Respuesta 2..."
        value={form.responses.join(", ")}
        onChange={(e) =>
          setForm({
            ...form,
            responses: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
          })
        }
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.faq}
          onChange={(e) => setForm({ ...form, faq: e.target.checked })}
        />
        Mostrar como Pregunta Frecuente
      </label>

      <div className="space-y-2">
        <label className="text-sm font-medium">Archivos</label>
        <input type="file" multiple onChange={(e) => setFilesToUpload(e.target.files)} />
        {form.id && form.files?.length > 0 && (
          <ul className="text-sm space-y-1 mt-2">
            {form.files.map((f) => (
              <li key={f.path} className="flex items-center justify-between">
                <a
                  href={`${INTENTS_API}${f.path}`}
                  className="text-blue-600 underline"
                  download
                >
                  {f.filename}
                </a>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => removeFile(form.id, f.path)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="bg-[#722F37] hover:bg-[#5a2529] text-white px-3 py-2 rounded disabled:opacity-60"
          onClick={saveIntent}
          disabled={loading || !form.title}
        >
          {form.id ? "Guardar cambios" : "Crear intención"}
        </button>
        <button className="border px-3 py-2 rounded" onClick={resetForm} disabled={loading}>
          Limpiar
        </button>
      </div>
    </div>
  </div>

  {/* Derecha: Listado de Intenciones */}
  <div className="bg-white rounded-lg shadow p-5">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold">Intenciones</h2>
      <button
        className="text-sm text-[#722F37] hover:underline"
        onClick={refreshList}
        disabled={loading}
      >
        {loading ? "Actualizando..." : "Actualizar"}
      </button>
    </div>

    {Array.isArray(intents) && intents.length === 0 ? (
      <p className="text-sm text-gray-600">No hay intenciones creadas aún.</p>
    ) : Array.isArray(intents) ? (
      <ul className="space-y-3">
        {intents.map((i) => (
          <li key={i.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{i.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Patrones: <span className="text-gray-800">{i.patterns.join(" | ")}</span>
                </p>
                <p className="text-xs text-gray-600">
                  Respuestas: <span className="text-gray-800">{i.responses.join(" | ")}</span>
                </p>
                {i.faq && <span className="text-xs text-green-700">FAQ</span>}
                {i.updatedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Actualizado: {new Date(i.updatedAt).toLocaleString("es-ES")}
                  </p>
                )}
                {i.files?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium">Archivos:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      {i.files.map((f) => (
                        <li key={`${i.id}-${f.path}`} className="flex items-center justify-between">
                          <a
                            href={`${INTENTS_API}${f.path}`}
                            className="text-blue-600 underline"
                            download
                          >
                            {f.filename}
                          </a>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => removeFile(i.id, f.path)}
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button className="border px-3 py-1 rounded" onClick={() => editIntent(i)}>
                  Editar
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => deleteIntent(i.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-600">No se pudo cargar el listado.</p>
    )}
  </div>
</div>
{/* Usuarios: formulario + listado, debajo del grid */}
<div className="bg-white rounded-lg shadow p-5 space-y-4 mt-6">
  <h2 className="text-lg font-semibold">Usuarios</h2>

  <label className="text-sm font-medium">Nombre de usuario</label>
  <input
    className="w-full border rounded p-2"
    placeholder="Usuario"
    value={userForm.username}
    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
  />

  <label className="text-sm font-medium">Contraseña</label>
  <input
    type="password"
    className="w-full border rounded p-2"
    placeholder="Contraseña"
    value={userForm.password || ""}
    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
  />

  <label className="text-sm font-medium">Rol</label>
  <select
    className="w-full border rounded p-2"
    value={userForm.role || ""}
    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
  >
    <option value="">Selecciona un rol</option>
    <option value="admin">Admin</option>
    <option value="editor">Editor</option>
    <option value="viewer">Viewer</option>
  </select>

  <div className="flex gap-2">
    <button
      className="bg-[#722F37] hover:bg-[#5a2529] text-white px-3 py-2 rounded disabled:opacity-60"
      onClick={saveUser}
      disabled={loading || !userForm.username || !userForm.password || !userForm.role}
    >
      {userForm.id ? "Guardar cambios" : "Crear usuario"}
    </button>
    <button
      className="border px-3 py-2 rounded"
      onClick={resetUserForm}
      disabled={loading}
    >
      Limpiar
    </button>
  </div>

  {/* Listado de usuarios */}
  {Array.isArray(users) && users.length === 0 ? (
    <p className="text-sm text-gray-600">No hay usuarios creados aún.</p>
  ) : Array.isArray(users) ? (
    <ul className="space-y-3">
      {users.map((u) => (
        <li key={u.id} className="border rounded-lg p-3 flex justify-between items-center">
          <div>
            <p className="font-medium">{u.username}</p>
            {u.role && <p className="text-xs text-gray-600">Rol: {u.role}</p>}
            {u.lastLogin && (
              <p className="text-xs text-gray-500">
                Última conexión: {new Date(u.lastLogin).toLocaleString("es-ES")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button className="border px-3 py-1 rounded" onClick={() => editUser(u)}>
              Editar
            </button>
            <button
              className="bg-red-600 text-white px-3 py-1 rounded"
              onClick={() => deleteUser(u.id)}
            >
              Eliminar
            </button>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-gray-600">No se pudo cargar usuarios.</p>
  )}
</div>

          

        </div>
      </div>
  )
}
