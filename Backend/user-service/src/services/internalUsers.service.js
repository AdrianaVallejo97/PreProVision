const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { pool } = require("../config/db");

// Helpers
async function getRoleId(roleName) {
  const [roles] = await pool.query(
    "SELECT roleId FROM roles WHERE roleName = ? LIMIT 1",
    [roleName]
  );
  if (!roles.length) return null;
  return roles[0].roleId;
}

/**
 * Crear usuario
 * status opcional: ACTIVE | DISABLED
 */
async function createUser({ name, email, password, roleName, status = "ACTIVE" }) {
  // 1) Verificar si ya existe
  const [exists] = await pool.query(
    "SELECT userId FROM users WHERE email = ? LIMIT 1",
    [email]
  );

  if (exists.length) {
    return { ok: false, status: 409, error: "User already exists" };
  }

  // 2) Obtener roleId
  const roleId = await getRoleId(roleName);
  if (!roleId) {
    return { ok: false, status: 400, error: "Invalid role" };
  }

  // 3) userId texto
  const userId = `${roleName.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;

  // 4) Hash password
  const hashed = await bcrypt.hash(password, 10);

  // 5) Insertar
  const finalStatus = (status === "DISABLED") ? "DISABLED" : "ACTIVE";

  await pool.query(
    `INSERT INTO users (userId, name, email, password, roleId, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, name, email, hashed, roleId, finalStatus]
  );

  return {
    ok: true,
    user: { userId, name, email, roleName, status: finalStatus }
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
     ORDER BY u.creationDate DESC`
  );
  return rows;
}

/**
 * Update (PATCH) por userId
 * Campos opcionales: name, email, password, roleName, status
 */
async function updateUser(userId, payload = {}) {
  // 1) Buscar actual
  const [rows] = await pool.query(
    `SELECT u.userId, u.name, u.email, u.status, r.roleName
     FROM users u JOIN roles r ON r.roleId = u.roleId
     WHERE u.userId = ? LIMIT 1`,
    [userId]
  );

  const current = rows[0];
  if (!current) return { ok: false, status: 404, error: "User not found" };

  const fields = [];
  const values = [];

  if (payload.name != null) {
    fields.push("name = ?");
    values.push(payload.name);
  }

  if (payload.email != null) {
    // validar duplicado si cambia
    const [exists] = await pool.query(
      "SELECT userId FROM users WHERE email = ? AND userId <> ? LIMIT 1",
      [payload.email, userId]
    );
    if (exists.length) return { ok: false, status: 409, error: "Email already in use" };

    fields.push("email = ?");
    values.push(payload.email);
  }

  if (payload.password) {
    const hashed = await bcrypt.hash(payload.password, 10);
    fields.push("password = ?");
    values.push(hashed);
  }

  if (payload.roleName) {
    const roleId = await getRoleId(payload.roleName);
    if (!roleId) return { ok: false, status: 400, error: "Invalid role" };

    fields.push("roleId = ?");
    values.push(roleId);
  }

  if (payload.status) {
    const s = payload.status === "DISABLED" ? "DISABLED" : "ACTIVE";
    fields.push("status = ?");
    values.push(s);
  }

  if (!fields.length) {
    return { ok: true, user: current };
  }

  values.push(userId);

  await pool.query(
    `UPDATE users SET ${fields.join(", ")} WHERE userId = ?`,
    values
  );

  // devolver actualizado
  const [after] = await pool.query(
    `SELECT u.userId, u.name, u.email, u.status, r.roleName
     FROM users u JOIN roles r ON r.roleId = u.roleId
     WHERE u.userId = ? LIMIT 1`,
    [userId]
  );

  return { ok: true, user: after[0] };
}

/**
 * "Delete" -> soft delete: status DISABLED
 */
async function disableUser(userId) {
  const [rows] = await pool.query(
    "SELECT userId FROM users WHERE userId = ? LIMIT 1",
    [userId]
  );
  if (!rows.length) return { ok: false, status: 404, error: "User not found" };

  await pool.query(
    "UPDATE users SET status = 'DISABLED' WHERE userId = ?",
    [userId]
  );

  return { ok: true };
}

module.exports = { createUser, listUsers, updateUser, disableUser };
