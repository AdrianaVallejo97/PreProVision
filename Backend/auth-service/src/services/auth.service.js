const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT u.userId, u.name, u.email, u.password, u.status, r.roleName
     FROM users u
     JOIN roles r ON r.roleId = u.roleId
     WHERE u.email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function validatePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Útil si necesitas crear usuarios desde auth-service (opcional).
 * Si ya lo hace user-service, puedes NO usar esto.
 */
async function createUser({ userId, name, email, password, roleId }) {
  const hashed = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (userId, name, email, password, status, roleId)
     VALUES (?, ?, ?, ?, TRUE, ?)`,
    [userId, name, email, hashed, roleId]
  );
}

module.exports = {
  findUserByEmail,
  validatePassword,
  createUser
};
