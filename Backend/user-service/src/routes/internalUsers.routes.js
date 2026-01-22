const express = require("express");
const { body, param } = require("express-validator");
const { validationResult } = require("express-validator");
const { requireInternalKey } = require("../middlewares/internalKey.middleware");
const {
  createUser,
  listUsers
} = require("../services/internalUsers.service");

const router = express.Router();

/**
 * POST /internal/users
 * Crear usuario (ADMIN)
 */
router.post(
  "/users",
  requireInternalKey,
  [
    body("name").isString().isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6 }),
    body("roleName").isIn(["ADMIN", "STUDENT"])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation error", details: errors.array() });
    }

    const result = await createUser(req.body);
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(201).json({ user: result.user });
  }
);

/**
 * GET /internal/users
 * Listar usuarios (ADMIN)
 */
router.get(
  "/users",
  requireInternalKey,
  async (req, res) => {
    const users = await listUsers();
    res.json({ users });
  }
);

module.exports = { internalUsersRouter: router };
