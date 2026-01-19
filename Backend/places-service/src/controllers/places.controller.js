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

module.exports = { list, getById, create, update, close };
