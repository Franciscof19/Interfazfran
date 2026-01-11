const jwt = require("jsonwebtoken");

const JWT_SECRET = "mysuperlongsecretkeythatshouldbeatleast32characters!!!123456"; 
const JWT_AUD = "themis-admin";                     // misma que en postgrest.conf

function signAdminToken(username) {
  return jwt.sign(
    { role: "app_admin", sub: username, aud: JWT_AUD },
    JWT_SECRET,
    { algorithm: "HS256", expiresIn: "2h" }
  );
}

const token = signAdminToken("oriana");
console.log("Token generado:", token);

