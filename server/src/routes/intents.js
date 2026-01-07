import express from "express"
import multer from "multer"
import {
  getIntents,
  createIntent,
  updateIntent,
  deleteIntent,
  addFilesToIntent,
  removeFileFromIntent
} from "../models/Intent.js"
import auth from "../middleware/auth.js"
import path from "path"
import fs from "fs"

const router = express.Router()

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})
const upload = multer({ storage })

// ✅ Obtener todas las intenciones
router.get("/", auth, async (req, res) => {
  try {
    const intents = await getIntents()
    res.json(intents)
  } catch (err) {
    console.error("Error al obtener intenciones:", err)
    res.status(500).json({ error: "No se pudieron cargar las intenciones" })
  }
})

// ✅ Crear intención
router.post("/", auth, async (req, res) => {
  try {
    const intent = await createIntent(req.body)
    res.json(intent)
  } catch (err) {
    console.error("Error al crear intención:", err)
    res.status(400).json({ error: "Error al crear intención" })
  }
})

// ✅ Editar intención
router.put("/:id", auth, async (req, res) => {
  try {
    const intent = await updateIntent(req.params.id, req.body)
    res.json(intent)
  } catch (err) {
    console.error("Error al actualizar intención:", err)
    res.status(400).json({ error: "Error al actualizar intención" })
  }
})

// ✅ Eliminar intención
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await deleteIntent(req.params.id)
    res.json(result)
  } catch (err) {
    console.error("Error al eliminar intención:", err)
    res.status(400).json({ error: "Error al eliminar intención" })
  }
})

// ✅ Subir archivos
router.post("/:id/files", auth, upload.array("files"), async (req, res) => {
  try {
    const newFiles = req.files.map((file) => ({
      filename: file.originalname,
      path: "/" + file.path.replace(/\\/g, "/")
    }))
    const intent = await addFilesToIntent(req.params.id, newFiles)
    res.json(intent)
  } catch (err) {
    console.error("Error al subir archivos:", err)
    res.status(400).json({ error: "Error al subir archivos" })
  }
})

// ✅ Eliminar archivo
router.delete("/:id/files", auth, async (req, res) => {
  try {
    const { path: filePath } = req.body
    const intent = await removeFileFromIntent(req.params.id, filePath)

    const fullPath = path.join(process.cwd(), filePath)
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)

    res.json({ message: "Archivo eliminado", intent })
  } catch (err) {
    console.error("Error al eliminar archivo:", err)
    res.status(400).json({ error: "Error al eliminar archivo" })
  }
})

export default router
