function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.roleName;
    if (!role) return res.status(403).json({ error: "No role in token" });

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}

module.exports = { requireRole };