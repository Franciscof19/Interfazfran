// Importar dependencias
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path" // 1. Añadimos esto para manejar rutas
import { fileURLToPath } from "url" // Necesario para obtener la ruta en módulos ES

// Rutas
import authRoutes from "./routes/auth.js"
import intentRoutes from "./routes/intents.js"
import usersRouter from "./routes/users.js"
import "./db.js" // Inicializa la conexión

dotenv.config()
const app = express()

// Configuración para obtener la ruta actual (necesario en ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors())
app.use(express.json())


// Servir archivos estáticos permitiendo visualización y descarga
app.use("/docs", express.static(path.join(process.cwd(), "public", "docs"), {
    setHeaders: (res, path) => {
        // Permitimos que el navegador sepa que puede haber descargas (CORS)
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    }
}));


// Rutas principales
app.use("/auth", authRoutes)
app.use("/intents", intentRoutes)
app.use("/users", usersRouter)

// Ruta de prueba
app.get("/health", (req, res) => {
  res.json({ ok: true })
})

// Arranque del servidor
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`🚀 API corriendo en puerto ${PORT}`))