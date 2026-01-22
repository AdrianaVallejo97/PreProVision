const express = require("express");
const cors = require("cors");

const { internalAuthRouter } = require("./src/routes/internalAuth.routes.js");
const { internalUsersRouter } = require("./src/routes/internalUsers.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "UP", service: "user-service" });
});

app.use("/internal", internalAuthRouter);
app.use("/internal", internalUsersRouter);

module.exports = app;
