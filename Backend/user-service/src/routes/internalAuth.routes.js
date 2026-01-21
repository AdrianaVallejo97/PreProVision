const express = require("express");
const { body } = require("express-validator");
const { validationResult } = require("express-validator");
const { requireInternalKey } = require("../middlewares/internalKey.middleware.js");
const { verifyUserCredentials } = require("../services/internalAuth.service.js");

const router = express.Router();

router.post(
  "/auth/verify",
  requireInternalKey,
  [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation error" });

    const { email, password } = req.body;
    const result = await verifyUserCredentials(email, password);

    if (!result.ok) return res.status(result.status).json({ error: result.error });
    return res.json({ user: result.user });
  }
);

module.exports = { internalAuthRouter: router };
