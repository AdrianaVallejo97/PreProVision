const express = require("express");
const cors = require("cors");

const { connectMongo } = require("./src/config/mongo");
const { quotasRouter } = require("./src/routes/quotas.routes");
const { errorMiddleware } = require("./src/middlewares/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "quotas-service" });
});

app.use("/quotas", quotasRouter);
app.use(errorMiddleware);

connectMongo().catch((err) => {
  console.error("Mongo error:", err.message);
  process.exit(1);
});

module.exports = app;
