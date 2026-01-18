function requireInternalKey(req, res, next) {
  const key = req.headers["x-internal-key"];
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "Unauthorized internal request" });
  }
  next();
}

module.exports = { requireInternalKey };
