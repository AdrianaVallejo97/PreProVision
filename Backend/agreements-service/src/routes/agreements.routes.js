const express = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../utils/validate");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/agreements.controller");

const router = express.Router();

// GET /agreements  (ADMIN: todo, STUDENT: lo suyo)
router.get("/", requireAuth, ctrl.list);

// GET /agreements/:id
router.get("/:id", requireAuth, [param("id").isMongoId(), validate], ctrl.getById);

// POST /agreements  (STUDENT)
router.post(
  "/",
  requireAuth,
  requireRole("STUDENT"),
  [body("placeId").isMongoId(), validate],
  ctrl.create
);

// PATCH /agreements/:id/approve (ADMIN)
router.patch(
  "/:id/approve",
  requireAuth,
  requireRole("ADMIN"),
  [param("id").isMongoId(), validate],
  ctrl.approve
);

// PATCH /agreements/:id/reject (ADMIN)
router.patch(
  "/:id/reject",
  requireAuth,
  requireRole("ADMIN"),
  [param("id").isMongoId(), validate],
  ctrl.reject
);

// PATCH /agreements/:id/cancel (STUDENT)
router.patch(
  "/:id/cancel",
  requireAuth,
  requireRole("STUDENT"),
  [param("id").isMongoId(), validate],
  ctrl.cancel
);

router.get(
  "/place/:placeId/approved-users",
  requireAuth,
  requireRole("ADMIN"),
  [param("placeId").isMongoId(), validate],
  ctrl.approvedStudentsByPlace
);

module.exports = { agreementsRouter: router };
