const { validationResult } = require("express-validator");
const { signToken } = require("../utils/jwt");
const { verifyCredentials } = require("../services/userClient.service");

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Validation error", details: errors.array() });
    }

    const { email, password } = req.body;

    // ✅ user-service valida credenciales (password/status/rol)
    const user = await verifyCredentials(email, password);

    // ✅ auth-service solo firma JWT
    const token = signToken({
      userId: user.userId,
      email: user.email,
      roleName: user.roleName
    });

    return res.json({
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        roleName: user.roleName
      }
    });
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
