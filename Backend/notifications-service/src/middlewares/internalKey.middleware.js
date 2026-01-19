function requireInternalKey(req, res, next) {
  const key = req.headers["x-internal-key"];
  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ error: "Invalid internal key" });
  }
  next();
}

module.exports = { requireInternalKey };
