const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { monitoringRouter } = require("./src/routes/monitoring.routes");
const { errorMiddleware } = require("./src/middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.use("/", monitoringRouter);
app.use(errorMiddleware);

module.exports = app;
