const express = require("express");
const { body, param } = require("express-validator");

const { validate } = require("../utils/validate");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/quotas.controller");
const { requireInternalKey } = require("../middlewares/internalKey.middleware");


const router = express.Router();

// ✅ health simple (opcional)
router.get("/", (req, res) => {
  res.json({ ok: true, message: "quotas-service is running. Use /quotas/:placeId" });
});

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
// INTERNAL: crear quota inicial (solo microservicios)
router.post(
  "/internal",
  requireInternalKey,
  [body("placeId").isString(), body("capacity").isInt({ min: 0 }), validate],
  ctrl.create
);

module.exports = { quotasRouter: router };
