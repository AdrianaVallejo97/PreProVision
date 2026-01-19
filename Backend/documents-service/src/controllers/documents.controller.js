const crypto = require("crypto");
const Document = require("../models/Document");
const { getBucket } = require("../config/firebase");

// LIST (user ve los suyos, admin ve todo)
async function list(req, res, next) {
  try {
    const isAdmin = req.user?.roleName === "ADMIN";
    const query = isAdmin ? {} : { ownerUserId: req.user.userId };

    const docs = await Document.find(query).sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (e) {
    next(e);
  }
}

// GET metadata
async function getById(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const isAdmin = req.user?.roleName === "ADMIN";
    const isOwner = doc.ownerUserId === req.user.userId;
    if (!isAdmin && !isOwner) return res.status(403).json({ error: "Forbidden" });

    res.json({ document: doc });
  } catch (e) {
    next(e);
  }
}

// UPLOAD: sube a Firebase + guarda metadata
async function upload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing file (field name: file)" });

    const bucket = getBucket();
    const ext = (req.file.originalname.split(".").pop() || "").toLowerCase();
    const random = crypto.randomBytes(8).toString("hex");
    const storagePath = `documents/${req.user.userId}/${Date.now()}_${random}${ext ? "." + ext : ""}`;

    const file = bucket.file(storagePath);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
      resumable: false
    });

    // URL pública simple (si tu bucket permite). Si no, lo dejamos null y luego haces signedUrl.
    let downloadURL = null;
    try {
      downloadURL = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(storagePath)}`;
    } catch (_) {}

    const doc = await Document.create({
      ownerUserId: req.user.userId,
      agreementId: req.body.agreementId || null,
      fileName: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      storagePath,
      bucket: bucket.name,
      downloadURL
    });

    res.status(201).json({ document: doc });
  } catch (e) {
    next(e);
  }
}

// DELETE: borra Firebase + Mongo (owner o admin)
async function remove(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    const isAdmin = req.user?.roleName === "ADMIN";
    const isOwner = doc.ownerUserId === req.user.userId;
    if (!isAdmin && !isOwner) return res.status(403).json({ error: "Forbidden" });

    const bucket = getBucket();
    await bucket.file(doc.storagePath).delete({ ignoreNotFound: true });

    await Document.deleteOne({ _id: doc._id });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, upload, remove };
