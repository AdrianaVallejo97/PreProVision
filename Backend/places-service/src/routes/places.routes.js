const express = require("express");
const { body, param } = require("express-validator");

const { validate } = require("../utils/validate.js");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const ctrl = require("../controllers/places.controller");

const router = express.Router();

// Public
router.get("/", ctrl.list);
router.get("/:id", [param("id").isMongoId(), validate], ctrl.getById);

// ADMIN create
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [
    body("name").isString().isLength({ min: 3 }),
    body("description").optional().isString(),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("capacity").optional().isInt({ min: 0 }),
    validate
  ],
  ctrl.create
);

// ADMIN update
router.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  [
    param("id").isMongoId(),
    body("name").optional().isString().isLength({ min: 3 }),
    body("description").optional().isString(),
    body("startDate").optional().isISO8601(),
    body("endDate").optional().isISO8601(),
    body("capacity").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["OPEN", "CLOSED"]),
    validate
  ],
  ctrl.update
);

// ADMIN close
router.patch(
  "/:id/close",
  requireAuth,
  requireRole("ADMIN"),
  [param("id").isMongoId(), validate],
  ctrl.close
);

// ✅ ADMIN delete
router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  [param("id").isMongoId(), validate],
  ctrl.remove
);

module.exports = { placesRouter: router };
