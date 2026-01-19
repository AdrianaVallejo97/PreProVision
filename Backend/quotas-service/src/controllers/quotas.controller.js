const Quota = require("../models/Quota");

// GET /quotas/:placeId  (cualquiera autenticado)
async function getByPlace(req, res, next) {
  try {
    const { placeId } = req.params;
    const quota = await Quota.findOne({ placeId });

    if (!quota) {
      return res.status(404).json({ error: "Quota not found for this placeId" });
    }

    res.json({
      quota: {
        placeId: quota.placeId,
        capacity: quota.capacity,
        used: quota.used,
        available: quota.available
      }
    });
  } catch (e) {
    next(e);
  }
}

// POST /quotas  (ADMIN) crear cuota inicial
async function create(req, res, next) {
  try {
    const { placeId, capacity } = req.body;

    const exists = await Quota.findOne({ placeId });
    if (exists) return res.status(409).json({ error: "Quota already exists for placeId" });

    const quota = await Quota.create({ placeId, capacity, used: 0 });
    res.status(201).json({ quota });
  } catch (e) {
    next(e);
  }
}

// PATCH /quotas/:placeId/capacity (ADMIN)
async function setCapacity(req, res, next) {
  try {
    const { placeId } = req.params;
    const { capacity } = req.body;

    const quota = await Quota.findOne({ placeId });
    if (!quota) return res.status(404).json({ error: "Quota not found" });

    if (capacity < quota.used) {
      return res.status(400).json({ error: "capacity cannot be lower than used" });
    }

    quota.capacity = capacity;
    await quota.save();

    res.json({
      quota: {
        placeId: quota.placeId,
        capacity: quota.capacity,
        used: quota.used,
        available: quota.available
      }
    });
  } catch (e) {
    next(e);
  }
}

// POST /quotas/:placeId/reserve (ADMIN o interno)
async function reserve(req, res, next) {
  try {
    const { placeId } = req.params;
    const amount = Number(req.body.amount ?? 1);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount must be a positive integer" });
    }

    // Operación atómica: solo incrementa si hay espacio
    const quota = await Quota.findOneAndUpdate(
      { placeId, $expr: { $gte: [{ $subtract: ["$capacity", "$used"] }, amount] } },
      { $inc: { used: amount } },
      { new: true }
    );

    if (!quota) {
      return res.status(409).json({ error: "Not enough quota available" });
    }

    res.json({
      quota: {
        placeId: quota.placeId,
        capacity: quota.capacity,
        used: quota.used,
        available: quota.available
      }
    });
  } catch (e) {
    next(e);
  }
}

// POST /quotas/:placeId/release (ADMIN o interno)
async function release(req, res, next) {
  try {
    const { placeId } = req.params;
    const amount = Number(req.body.amount ?? 1);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount must be a positive integer" });
    }

    // Operación atómica: solo decrementa si used >= amount
    const quota = await Quota.findOneAndUpdate(
      { placeId, used: { $gte: amount } },
      { $inc: { used: -amount } },
      { new: true }
    );

    if (!quota) {
      return res.status(409).json({ error: "Cannot release more than used" });
    }

    res.json({
      quota: {
        placeId: quota.placeId,
        capacity: quota.capacity,
        used: quota.used,
        available: quota.available
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getByPlace, create, setCapacity, reserve, release };
