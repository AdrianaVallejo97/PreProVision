const express = require("express");
const cors = require("cors");
const { cacheRouter } = require("./src/routes/cache.routes");
const { errorMiddleware } = require("./src/middlewares/error.middleware");
const { connectRedis } = require("./src/config/redis");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "cache-service" });
});

// interno
app.use("/internal", cacheRouter);

app.use(errorMiddleware);

// Conectar Redis al arrancar
connectRedis().catch((err) => {
  console.error("Redis connection error:", err.message);
  process.exit(1);
});

module.exports = app;
