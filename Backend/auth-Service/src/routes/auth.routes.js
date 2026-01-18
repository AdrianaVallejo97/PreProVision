const express = require("express");
const { body } = require("express-validator");
const { login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

// POST /auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("email must be valid"),
    body("password").isString().isLength({ min: 6 }).withMessage("password min 6")
  ],
  login
);

// GET /auth/me
router.get("/me", requireAuth, me);

// Ejemplo: endpoint protegido solo ADMIN
router.get("/admin-only", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ ok: true, message: "Hello Admin" });
});

module.exports = { authRouter: router };
