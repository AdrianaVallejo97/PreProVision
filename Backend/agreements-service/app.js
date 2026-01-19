const express = require("express");
const cors = require("cors");

const { connectMongo } = require("./src/config/mongo");
const { agreementsRouter } = require("./src/routes/agreements.routes");
const { errorMiddleware } = require("./src/middlewares/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "agreements-service" });
});

app.use("/agreements", agreementsRouter);
app.use(errorMiddleware);

connectMongo().catch((err) => {
  console.error("Mongo error:", err.message);
  process.exit(1);
});

module.exports = app;
