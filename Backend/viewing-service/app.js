const express = require("express");
const cors = require("cors");
const { viewingPublicRouter } = require("./src/routes/viewing.public.routes");
app.use("/viewing", viewingPublicRouter); // ✅ nuevo (JWT)


const { connectMongo } = require("./src/config/mongo");
const { viewingRouter } = require("./src/routes/viewing.routes");
const { errorMiddleware } = require("./src/middlewares/error.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "viewing-service" });
});

app.use("/internal/viewing", viewingRouter);
app.use(errorMiddleware);

connectMongo().catch((err) => {
  console.error("Mongo error:", err.message);
  process.exit(1);
});

module.exports = app;
