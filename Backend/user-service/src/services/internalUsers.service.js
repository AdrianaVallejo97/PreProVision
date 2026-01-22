const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

/**
 * Crear usuario
 */
async function createUser({ name, email, password, roleName }) {
  // Verificar si ya existe
  const [exists] = await pool.query(
    "SELECT userId FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (exists.length) {
    return { ok: false, status: 409, error: "User already exists" };
  }

  // Obtener roleId
  const [roles] = await pool.query(
    "SELECT roleId FROM roles WHERE roleName = ? LIMIT 1",
    [roleName]
  );

  if (!roles.length) {
    return { ok: false, status: 400, error: "Invalid role" };
  }

  const roleId = roles[0].roleId;
  const hashed = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, roleId, status)
     VALUES (?, ?, ?, ?, 'ACTIVE')`,
    [name, email, hashed, roleId]
  );

  return {
    ok: true,
    user: {
      userId: result.insertId,
      name,
      email,
      roleName
    }
  };
}

/**
 * Listar usuarios
 */
async function listUsers() {
  const [rows] = await pool.query(
    `SELECT u.userId, u.name, u.email, u.status, r.roleName
     FROM users u
     JOIN roles r ON r.roleId = u.roleId
     ORDER BY u.userId DESC`
  );
  return rows;
}

module.exports = { createUser, listUsers };
