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
    const ag = await Agreement.create({
      userId: req.user.userId,
      placeId: req.body.placeId
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

    ag.status = "APPROVED";
    ag.approvedAt = new Date();
    await ag.save();

    // (Luego aquí llamaremos quotas-service para reservar cupo y emitir evento)
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

module.exports = { list, getById, create, approve, reject, cancel };
