const express = require("express");
const { body } = require("express-validator");
const { login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6 })
  ],
  login
);

router.get("/me", requireAuth, me);

module.exports = { authRouter: router };
