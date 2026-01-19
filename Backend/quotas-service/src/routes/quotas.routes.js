const express = require("express");
const { body, param } = require("express-validator");

const { validate } = require("../utils/validate");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/quotas.controller");

const router = express.Router();

// Consultar cuota (auth)
router.get(
  "/:placeId",
  requireAuth,
  [param("placeId").isString(), validate],
  ctrl.getByPlace
);

// Crear cuota (ADMIN)
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  [body("placeId").isString(), body("capacity").isInt({ min: 0 }), validate],
  ctrl.create
);

// Ajustar capacidad (ADMIN)
router.patch(
  "/:placeId/capacity",
  requireAuth,
  requireRole("ADMIN"),
  [param("placeId").isString(), body("capacity").isInt({ min: 0 }), validate],
  ctrl.setCapacity
);

// Reservar cupo (ADMIN por ahora)
router.post(
  "/:placeId/reserve",
  requireAuth,
  requireRole("ADMIN"),
  [param("placeId").isString(), body("amount").optional().isInt({ min: 1 }), validate],
  ctrl.reserve
);

// Liberar cupo (ADMIN por ahora)
router.post(
  "/:placeId/release",
  requireAuth,
  requireRole("ADMIN"),
  [param("placeId").isString(), body("amount").optional().isInt({ min: 1 }), validate],
  ctrl.release
);

module.exports = { quotasRouter: router };
