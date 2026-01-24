// Documents.routes.js

const express = require("express");
const multer = require("multer");

const { requireAuth } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const Document = require("../models/Document");
const { uploadDocument, signedUrl } = require("../services/documents.service");
const { hasApprovedAgreement, getApprovedPlaceIds } = require("../services/agreementsClient.service");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * ADMIN upload:
 * form-data:
 * - file
 * - kind (PLACE|AGREEMENT)
 * - entityId  (id de place o agreement)
 * - targetUserId (solo si kind=AGREEMENT)
 */
router.post(
  "/upload",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: "File is required" });

      const kind = String(req.body.kind || "PLACE");
      const entityId = String(req.body.entityId || "");
      const targetUserId = String(req.body.targetUserId || "");

      if (!entityId) {
        return res.status(400).json({ error: "entityId is required" });
      }

      if (kind === "AGREEMENT" && !targetUserId) {
        return res.status(400).json({ error: "targetUserId is required for AGREEMENT documents" });
      }

      // PLACE: carpeta por plaza / AGREEMENT: carpeta por estudiante
      const storageOwner = (kind === "PLACE") ? `place-${entityId}` : targetUserId;

      const result = await uploadDocument({
        file: req.file,
        userId: storageOwner
      });

      const doc = await Document.create({
        uploaderUserId: req.user.userId,
        targetUserId: kind === "PLACE" ? null : targetUserId,
        kind,
        entityId,
        path: result.path,
        originalName: req.file.originalname
      });

      res.json({ message: "Document uploaded", document: doc });
    } catch (err) {
      next(err);
    }
  }
);

// ADMIN: listar documentos por PLACE/AGREEMENT + entityId
router.get("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const kind = String(req.query.kind || "");
    const entityId = String(req.query.entityId || "");

    const filter = {};
    if (kind) filter.kind = kind;
    if (entityId) filter.entityId = entityId;

    const docs = await Document.find(filter).sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (e) { next(e); }
});

// STUDENT: mis documentos (solo si tiene al menos un APPROVED)
// - incluye docs globales PLACE para plazas aprobadas
// - incluye docs AGREEMENT propios
router.get("/my", requireAuth, requireRole("STUDENT"), async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");

    const ok = await hasApprovedAgreement({
      gatewayUrl: process.env.API_GATEWAY_URL,
      token
    });

    if (!ok) {
      return res.json({
        documents: [],
        message: "No documents until you have an APPROVED agreement."
      });
    }

    const approvedPlaceIds = await getApprovedPlaceIds({
      gatewayUrl: process.env.API_GATEWAY_URL,
      token
    });

    const docs = await Document.find({
      $or: [
        // docs globales por plaza (para plazas aprobadas)
        { kind: "PLACE", entityId: { $in: approvedPlaceIds } },
        // docs individuales por estudiante
        { kind: "AGREEMENT", targetUserId: req.user.userId }
      ]
    }).sort({ createdAt: -1 });

    res.json({ documents: docs });
  } catch (e) { next(e); }
});

// Signed URL download (ADMIN cualquiera / STUDENT solo si aplica)
router.get("/signed-url", requireAuth, async (req, res, next) => {
  try {
    const path = String(req.query.path || "");
    if (!path) return res.status(400).json({ error: "path is required" });

    const doc = await Document.findOne({ path });
    if (!doc) return res.status(404).json({ error: "Document not found" });

    // Si es AGREEMENT y es STUDENT, debe ser suyo
    if (req.user.roleName === "STUDENT" && doc.kind === "AGREEMENT" && doc.targetUserId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Si es PLACE y es STUDENT, debe tener una plaza APPROVED que coincida con entityId
    if (req.user.roleName === "STUDENT" && doc.kind === "PLACE") {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      const approvedPlaceIds = await getApprovedPlaceIds({
        gatewayUrl: process.env.API_GATEWAY_URL,
        token
      });

      if (!approvedPlaceIds.includes(String(doc.entityId))) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }

    const url = await signedUrl(path);
    res.json({ url });
  } catch (e) { next(e); }
});

module.exports = { documentsRouter: router };
