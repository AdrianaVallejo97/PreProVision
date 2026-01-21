const express = require("express");
const cors = require("cors");

const { authRouter } = require("./routes/auth.routes");
const { errorMiddleware } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "auth-service" });
});

app.use("/auth", authRouter);
app.use(errorMiddleware);

module.exports = app;
