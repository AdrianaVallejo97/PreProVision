const express = require("express");
const cors = require("cors");

const { connectMongo } = require("./src/config/mongo");
const { documentsRouter } = require("./src/routes/documents.routes");
const { errorMiddleware } = require("./src/middlewares/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "documents-service" });
});

app.use("/documents", documentsRouter);

app.use(errorMiddleware);

// Conecta Mongo al arrancar
connectMongo().catch((err) => {
  console.error("Mongo connection error:", err.message);
  process.exit(1);
});

module.exports = app;
