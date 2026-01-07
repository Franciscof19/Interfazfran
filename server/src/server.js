// Importar dependencias
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pkg from "pg"

// Rutas
import authRoutes from "./routes/auth.js"
import intentRoutes from "./routes/intents.js"

dotenv.config()
const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Conexión a PostgreSQL
const { Pool } = pkg
export const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})

pool.connect()
  .then(() => console.log("✅ PostgreSQL conectado"))
  .catch(err => console.error("❌ Error al conectar PostgreSQL:", err))

// Rutas principales
app.use("/auth", authRoutes)
app.use("/intents", intentRoutes)

// Ruta de prueba
app.get("/health", (req, res) => {
  res.json({ ok: true })
})

// Arranque del servidor
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`🚀 API corriendo en puerto ${PORT}`))
