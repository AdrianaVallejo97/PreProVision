function errorMiddleware(err, req, res, next) {
  console.error("Monitoring error:", err);
  res.status(500).json({ error: "Internal monitoring error" });
}

module.exports = { errorMiddleware };
