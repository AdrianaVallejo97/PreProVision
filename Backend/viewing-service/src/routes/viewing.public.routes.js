const express = require("express");
const { body, query, validationResult } = require("express-validator");

const { requireAuth } = require("../middlewares/auth.jwt.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const View = require("../models/View");

const router = express.Router();

// Registrar vista (STUDENT o ADMIN)
router.post(
  "/track",
  requireAuth,
  [
    body("entityType").isIn(["DOCUMENT", "PLACE", "AGREEMENT"]),
    body("entityId").isString().isLength({ min: 1 }),
    body("metadata").optional().isObject()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation error" });

    const view = await View.create({
      userId: req.user.userId,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      metadata: req.body.metadata || {}
    });

    res.status(201).json({ view });
  }
);

// Resumen para reports (ADMIN)
router.get(
  "/summary",
  requireAuth,
  requireRole("ADMIN"),
  [
    query("entityType").isIn(["DOCUMENT", "PLACE", "AGREEMENT"]),
    query("days").optional().isInt({ min: 1, max: 365 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Validation error" });

    const days = Number(req.query.days || 7);
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const entityType = String(req.query.entityType);

    const rows = await View.aggregate([
      { $match: { entityType, createdAt: { $gte: from } } },
      { $group: { _id: "$entityId", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 20 }
    ]);

    res.json({ entityType, days, top: rows });
  }
);

module.exports = { viewingPublicRouter: router };
