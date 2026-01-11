// middleware/auth.js
import jwt from "jsonwebtoken"

export default function auth(req, res, next) {
  // TEMP: confirmar que la clave está disponible
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET no está cargado")
    return res.status(500).json({ error: "Config JWT ausente" })
  }

  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: "Token requerido" })

  const token = header.split(" ")[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    // TEMP: ver qué trae el payload
    console.log("Auth OK payload:", decoded)
    next()
  } catch (e) {
    console.error("Auth fallo:", e.message)
    res.status(401).json({ error: "Token inválido" })
  }
}
