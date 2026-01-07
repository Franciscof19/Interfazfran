import { pool } from "../server.js"

// Crear usuario
export async function createUser({ username, password }) {
  const result = await pool.query(
    "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
    [username, password]
  )
  return result.rows[0]
}

// Buscar usuario por username
export async function findUserByUsername(username) {
  const result = await pool.query("SELECT * FROM users WHERE username=$1", [username])
  return result.rows[0]
}

// Buscar usuario por id
export async function findUserById(id) {
  const result = await pool.query("SELECT id, username FROM users WHERE id=$1", [id])
  return result.rows[0]
}
