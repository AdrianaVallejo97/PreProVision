const express = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../utils/validate");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/agreements.controller");

const router = express.Router();

router.get("/", requireAuth, ctrl.list);

router.get(
  "/:id",
  requireAuth,
  [param("id").isMongoId(), validate],
  ctrl.getById
);

router.post(
  "/",
  requireAuth,
  [
    body("placeId").isString(),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    validate
  ],
  ctrl.create
);

router.patch(
  "/:id/approve",
  requireAuth,
  requireRole("ADMIN"),
  [param("id").isMongoId(), validate],
  ctrl.approve
);

router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("ADMIN"),
  [param("id").isMongoId(), validate],
  ctrl.reject
);

module.exports = { agreementsRouter: router };
