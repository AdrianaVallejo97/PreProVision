const express = require("express");
const { client } = require("../metrics/prom.metrics");

const router = express.Router();

router.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

router.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "monitoring-service",
    timestamp: new Date().toISOString()
  });
});

module.exports = { monitoringRouter: router };
