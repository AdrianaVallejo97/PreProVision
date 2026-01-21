const bcrypt = require("bcryptjs");
const { pool } = require("../config/db.js");

// Valida credenciales consultando la BD del user-service
async function verifyUserCredentials(email, password) {
  const [rows] = await pool.query(
    `SELECT u.userId, u.name, u.email, u.password, u.status, r.roleName
     FROM users u
     JOIN roles r ON r.roleId = u.roleId
     WHERE u.email = ? LIMIT 1`,
    [email]
  );

  const user = rows[0];

  if (!user) {
    return { ok: false, status: 401, error: "Invalid credentials" };
  }

  // Si manejas status como boolean o string, ajusta aquí
  if (user.status === 0 || user.status === "DISABLED" || user.status === "BLOCKED") {
    return { ok: false, status: 403, error: "User disabled" };
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { ok: false, status: 401, error: "Invalid credentials" };
  }

  return {
    ok: true,
    user: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      roleName: user.roleName,
      status: user.status
    }
  };
}

module.exports = { verifyUserCredentials };
