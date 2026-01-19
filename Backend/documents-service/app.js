const express = require("express");
const cors = require("cors");
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

module.exports = app;
