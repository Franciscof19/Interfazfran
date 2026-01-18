import express from "express"
// server/src/routes/intents.js
import { pool } from "../db.js"
import multer from "multer"
import {
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

// Configuración de multer para subir archivos en public/docs
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/docs"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
})
const upload = multer({ storage })

// ✅ Obtener todas las intenciones
router.get("/", async (req, res) => {
  try {
    // Modificación: Consulta directa con JOIN para traer los archivos de Supabase
    // Usamos las columnas que confirmaste: url, name, file_type
    const result = await pool.query(`
      SELECT 
        i.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'url', f.url, 
              'name', f.name, 
              'type', f.file_type
            )
          ) FILTER (WHERE f.id IS NOT NULL), 
          '[]'
        ) as files
      FROM intents i
      LEFT JOIN intents_files f ON i.id = f.intent_id
      GROUP BY i.id
      ORDER BY i.id ASC
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener intenciones:", err)
    res.status(500).json({ error: "No se pudieron cargar las intenciones", details: err.message })
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
      // Guardamos ruta relativa para servir desde Express
      path: "/docs/" + file.filename
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

    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const fullPath = path.join(process.cwd(), "public", relativePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)

    res.json({ message: "Archivo eliminado", intent })
  } catch (err) {
    console.error("Error al eliminar archivo:", err)
    res.status(400).json({ error: "Error al eliminar archivo" })
  }
})

router.post("/:id/use", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Agregamos un log para ver si la petición llega al servidor
    console.log("Solicitud de incremento para ID:", id);

    const result = await pool.query(
      "UPDATE intents SET usage_count = COALESCE(usage_count, 0) + 1 WHERE id = $1 RETURNING usage_count",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Intención no encontrada" });
    }

    console.log("Nuevo valor para ID " + id + ":", result.rows[0].usage_count);
    res.json({ success: true, newCount: result.rows[0].usage_count });
  } catch (err) {
    console.error("❌ Error en el contador:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


export default router
