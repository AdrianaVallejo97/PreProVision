const Place = require("../models/Place");

async function list(req, res, next) {
  try {
    const places = await Place.find().sort({ createdAt: -1 });
    res.json({ places });
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json({ place });
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const place = await Place.create({
      name: req.body.name,
      description: req.body.description || "",
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      capacity: req.body.capacity ?? 0
    });

    // ✅ Crear quota inicial automáticamente (capacity = place.capacity)
    try {
      await fetch(`${process.env.QUOTAS_SERVICE_URL}/quotas/internal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.INTERNAL_API_KEY
        },
        body: JSON.stringify({
          placeId: String(place._id),
          capacity: Number(place.capacity ?? 0)
        })
      });
    } catch (e) {
      console.warn("Quota init failed:", e.message);
      // No tumbes el create por esto
    }

    res.status(201).json({ place });
  } catch (e) { next(e); }
}


async function update(req, res, next) {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json({ place });
  } catch (e) { next(e); }
}

async function close(req, res, next) {
  try {
    const place = await Place.findByIdAndUpdate(
      req.params.id,
      { status: "CLOSED" },
      { new: true }
    );
    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json({ place });
  } catch (e) { next(e); }
}
async function remove(req, res, next) {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ error: "Place not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
}


module.exports = { list, getById, create, update, close, remove };
