const express = require("express");
const multer = require("multer");
const { param, body } = require("express-validator");
const { validate } = require("../utils/validate");
const { requireAuth } = require("../middlewares/auth.middleware");

const ctrl = require("../controllers/documents.controller");

const router = express.Router();

// multer memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB (ajusta si quieres)
});

// GET /documents
router.get("/", requireAuth, ctrl.list);

// GET /documents/:id
router.get("/:id", requireAuth, [param("id").isMongoId(), validate], ctrl.getById);

// POST /documents/upload (multipart)
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  [
    body("agreementId").optional().isString(),
    validate
  ],
  ctrl.upload
);

// DELETE /documents/:id
router.delete("/:id", requireAuth, [param("id").isMongoId(), validate], ctrl.remove);

module.exports = { documentsRouter: router };
