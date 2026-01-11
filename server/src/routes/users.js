// routes/users.js
import express from "express"
import bcrypt from "bcrypt"
import { pool } from "../server.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// ✅ Listar todos los usuarios (sin contraseñas)
router.get("/", auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, role FROM users")
    res.json(result.rows)
  } catch (err) {
    console.error("Error al obtener usuarios:", err)
    res.status(500).json({ error: "No se pudieron cargar los usuarios" })
  }
})

// ✅ Crear usuario (contraseña se hashea automáticamente)
router.post("/", auth, async (req, res) => {
  try {
    const { username, password, role } = req.body
    const hashed = await bcrypt.hash(password, 10)

    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role",
      [username, hashed, role || "viewer"]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error("Error al crear usuario:", err)
    res.status(400).json({ error: "No se pudo crear el usuario" })
  }
})

// ✅ Editar usuario (incluye contraseña si se envía)
router.patch("/:id", auth, async (req, res) => {
  try {
    const { username, password, role } = req.body
    const hashed = password ? await bcrypt.hash(password, 10) : null

    const result = await pool.query(
      "UPDATE users SET username=$1, password=COALESCE($2,password), role=$3 WHERE id=$4 RETURNING id, username, role",
      [username, hashed, role, req.params.id]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error("Error al editar usuario:", err)
    res.status(400).json({ error: "No se pudo editar el usuario" })
  }
})

// ✅ Actualizar solo el rol de usuario
router.put("/:id", auth, async (req, res) => {
  try {
    const { role } = req.body
    const result = await pool.query(
      "UPDATE users SET role=$1 WHERE id=$2 RETURNING id, username, role",
      [role, req.params.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error("Error al actualizar usuario:", err)
    res.status(400).json({ error: "No se pudo actualizar el usuario" })
  }
})

// ✅ Eliminar usuario
router.delete("/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    console.error("Error al eliminar usuario:", err)
    res.status(400).json({ error: "No se pudo eliminar el usuario" })
  }
})

export default router
