const Agreement = require("../models/Agreement");

async function list(req, res, next) {
  try {
    const isAdmin = req.user.roleName === "ADMIN";
    const query = isAdmin ? {} : { userId: req.user.userId };

    const agreements = await Agreement.find(query).sort({ createdAt: -1 });
    res.json({ agreements });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ error: "Not found" });

    if (
      req.user.roleName !== "ADMIN" &&
      agreement.userId !== req.user.userId
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ agreement });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const agreement = await Agreement.create({
      userId: req.user.userId,
      placeId: req.body.placeId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      notes: req.body.notes || ""
    });

    res.status(201).json({ agreement });
  } catch (e) {
    next(e);
  }
}

async function approve(req, res, next) {
  try {
    const agreement = await Agreement.findByIdAndUpdate(
      req.params.id,
      { status: "APPROVED" },
      { new: true }
    );

    if (!agreement) return res.status(404).json({ error: "Not found" });
    res.json({ agreement });
  } catch (e) {
    next(e);
  }
}

async function reject(req, res, next) {
  try {
    const agreement = await Agreement.findByIdAndUpdate(
      req.params.id,
      { status: "REJECTED" },
      { new: true }
    );

    if (!agreement) return res.status(404).json({ error: "Not found" });
    res.json({ agreement });
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, create, approve, reject };
