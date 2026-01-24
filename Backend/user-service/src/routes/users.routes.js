const express = require("express");
const { body, param, validationResult } = require("express-validator");

const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { createUser, listUsers, updateUser, disableUser } = require("../services/internalUsers.service");

const router = express.Router();

/**
 * PUBLIC ADMIN USERS
 * Base: /users
 */

router.get("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const users = await listUsers();
    res.json({ users });
  } catch (e) { next(e); }
});

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [
    body("name").isString().isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6 }),
    body("roleName").isIn(["ADMIN", "STUDENT"]),
    body("status").optional().isIn(["ACTIVE", "DISABLED"])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: "Validation error", details: errors.array() });

      const result = await createUser(req.body);
      if (!result.ok) return res.status(result.status).json({ error: result.error });

      res.status(201).json({ user: result.user });
    } catch (e) { next(e); }
  }
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  [
    param("id").isString().isLength({ min: 3 }),
    body("name").optional().isString().isLength({ min: 3 }),
    body("email").optional().isEmail(),
    body("password").optional().isString().isLength({ min: 6 }),
    body("roleName").optional().isIn(["ADMIN", "STUDENT"]),
    body("status").optional().isIn(["ACTIVE", "DISABLED"])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ error: "Validation error", details: errors.array() });

      const result = await updateUser(req.params.id, req.body);
      if (!result.ok) return res.status(result.status).json({ error: result.error });

      res.json({ user: result.user });
    } catch (e) { next(e); }
  }
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  [param("id").isString().isLength({ min: 3 })],
  async (req, res, next) => {
    try {
      const result = await disableUser(req.params.id);
      if (!result.ok) return res.status(result.status).json({ error: result.error });

      res.json({ ok: true });
    } catch (e) { next(e); }
  }
);

module.exports = { usersRouter: router };
