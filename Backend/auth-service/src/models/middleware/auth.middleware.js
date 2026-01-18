const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, email, roleName }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
