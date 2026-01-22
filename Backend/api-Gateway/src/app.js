const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { gatewayRouter } = require("./routes/gateway.routes");
const { errorMiddleware } = require("./middlewares/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
//app.use(express.json());
app.use(morgan("combined"));

app.use("/", gatewayRouter);

app.use(errorMiddleware);

module.exports = app;
