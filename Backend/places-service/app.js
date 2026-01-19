const express = require("express");
const cors = require("cors");
const { connectMongo } = require("./src/config/mongo.js");
const { placesRouter } = require("./src/routes/places.routes");
const { errorMiddleware } = require("./src/middlewares/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  res.json({ status: "UP", service: "places-service" });
});

app.use("/places", placesRouter);

app.use(errorMiddleware);

// Conecta a Mongo al arrancar
connectMongo().catch((err) => {
  console.error("Mongo connection error:", err.message);
  process.exit(1);
});

module.exports = app;
