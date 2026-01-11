import jwt from "jsonwebtoken";

// Usa la misma clave que configuraste en postgrest.conf
const JWT_SECRET = "mysuperlongsecretkeythatshouldbeatleast32characters!!!123456"; 
// Debe coincidir con jwt-aud en postgrest.conf
const JWT_AUD = "themis-admin";

/**
 * Genera un token JWT para el rol app_admin
 * @param username - el nombre del usuario (ej. "oriana")
 */
export function signAdminToken(username: string) {
  return jwt.sign(
    {
      role: "app_admin",   // PostgREST usará este rol
      sub: username,       // sujeto del token
      aud: JWT_AUD         // audiencia
    },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "2h"
    }
  );
}
