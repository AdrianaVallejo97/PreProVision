const Agreement = require("../models/Agreement");

async function list(req, res, next) {
  try {
    // ADMIN ve todo, STUDENT ve solo lo suyo
    const role = req.user?.roleName;
    const filter = role === "ADMIN" ? {} : { userId: req.user.userId };

    const agreements = await Agreement.find(filter).sort({ createdAt: -1 });
    res.json({ agreements });
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const ag = await Agreement.findById(req.params.id);
    if (!ag) return res.status(404).json({ error: "Agreement not found" });

    const role = req.user?.roleName;
    if (role !== "ADMIN" && ag.userId !== req.user.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ agreement: ag });
  } catch (e) { next(e); }
}

// STUDENT crea solicitud (PENDING)
async function create(req, res, next) {
  try {
    const userId = req.user.userId;
    const placeId = req.body.placeId;

    // ✅ Evitar que el student se postule 2 veces a la misma plaza
    // Si ya existe una solicitud activa (PENDING o APPROVED), no permitas crear otra.
    const exists = await Agreement.findOne({
      userId,
      placeId,
      status: { $in: ["PENDING", "APPROVED"] }
    });

    if (exists) {
      return res.status(409).json({ error: "You already applied to this place." });
    }

    const ag = await Agreement.create({
      userId,
      placeId
    });

    res.status(201).json({ agreement: ag });
  } catch (e) { next(e); }
}

// ADMIN aprueba
async function approve(req, res, next) {
  try {
    const ag = await Agreement.findById(req.params.id);
    if (!ag) return res.status(404).json({ error: "Agreement not found" });

    if (ag.status !== "PENDING") return res.status(400).json({ error: "Only PENDING can be approved" });

    // ✅ reservar cupo (1) antes de aprobar
    const placeId = String(ag.placeId);
    const authHeader = req.headers.authorization || "";

    const reserveRes = await fetch(`${process.env.QUOTAS_SERVICE_URL}/quotas/${placeId}/reserve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({ amount: 1 })
    });

    const reserveData = await reserveRes.json().catch(() => ({}));

    if (!reserveRes.ok) {
      // típicamente 409 cuando no hay cupo
      return res.status(reserveRes.status).json({
        error: reserveData?.error || "Could not reserve quota"
      });
    }

    ag.status = "APPROVED";
    ag.approvedAt = new Date();
    await ag.save();

    res.json({ agreement: ag });
  } catch (e) { next(e); }
}

// ADMIN rechaza
async function reject(req, res, next) {
  try {
    const ag = await Agreement.findById(req.params.id);
    if (!ag) return res.status(404).json({ error: "Agreement not found" });

    if (ag.status !== "PENDING") return res.status(400).json({ error: "Only PENDING can be rejected" });

    ag.status = "REJECTED";
    ag.rejectedAt = new Date();
    await ag.save();

    res.json({ agreement: ag });
  } catch (e) { next(e); }
}

// STUDENT cancela su solicitud si sigue PENDING
async function cancel(req, res, next) {
  try {
    const ag = await Agreement.findById(req.params.id);
    if (!ag) return res.status(404).json({ error: "Agreement not found" });

    if (ag.userId !== req.user.userId) return res.status(403).json({ error: "Forbidden" });
    if (ag.status !== "PENDING") return res.status(400).json({ error: "Only PENDING can be cancelled" });

    ag.status = "CANCELLED";
    ag.cancelledAt = new Date();
    await ag.save();

    res.json({ agreement: ag });
  } catch (e) { next(e); }
}
async function approvedStudentsByPlace(req, res, next) {
  try {
    const placeId = req.params.placeId;

    const rows = await Agreement.find({
      placeId,
      status: "APPROVED"
    }).select("userId").lean();

    const userIds = [...new Set(rows.map(r => r.userId))];
    res.json({ userIds });
  } catch (e) { next(e); }
}

module.exports = { list, getById, create, approve, reject, cancel, approvedStudentsByPlace };

