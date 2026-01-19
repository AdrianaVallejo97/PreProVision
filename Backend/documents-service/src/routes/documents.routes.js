const express = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../utils/validate"); // ✅ AQUÍ
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = express.Router();

// ejemplo
router.post(
  "/upload",
  requireAuth,
  requireRole("ADMIN"),
  [
    body("path").isString(),
    validate
  ],
  async (req, res) => {
    res.json({ ok: true });
  }
);

module.exports = { documentsRouter: router };
