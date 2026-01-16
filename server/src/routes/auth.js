import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { pool } from "../server.js"   // Conexión a PostgreSQL

const router = express.Router()

// ✅ Registro de usuario
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body
  try {
    const hashed = await bcrypt.hash(password, 10)

    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role",
      [username, hashed, role || "viewer"]
    )

    res.json({ ok: true, user: result.rows[0] })
  } catch (err) {
    console.error("Error en registro:", err)
    res.status(400).json({ error: "No se pudo registrar" })
  }
})

// ✅ Login de usuario
router.post("/login", async (req, res) => {
  const { username, password } = req.body
  try {
    const result = await pool.query("SELECT * FROM users WHERE username=$1", [username])
    const user = result.rows[0]

    if (!user) return res.status(401).json({ error: "Usuario no encontrado" })

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({ token })
  } catch (err) {
    console.error("Error en login:", err)
    res.status(400).json({ error: "Error en login" })
  }
})

// ✅ Validar token y devolver usuario
router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]
    if (!authHeader) return res.status(401).json({ error: "Token requerido" })

    const token = authHeader.split(" ")[1]
    if (!token) return res.status(401).json({ error: "Token inválido" })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const result = await pool.query("SELECT id, username, role FROM users WHERE id=$1", [decoded.id])
    const user = result.rows[0]

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" })

    res.json({ user })
  } catch (err) {
    console.error("Error en auth:", err)
    res.status(401).json({ error: "Token inválido o expirado" })
  }
})

export default router


