const View = require("../models/View");

// registrar una vista
async function track(req, res, next) {
  try {
    const view = await View.create({
      userId: req.body.userId,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
      metadata: req.body.metadata || {}
    });

    res.status(201).json({ view });
  } catch (e) {
    next(e);
  }
}

// listar vistas (admin / analytics)
async function list(req, res, next) {
  try {
    const { userId, entityType, entityId } = req.query;

    const filter = {};
    if (userId) filter.userId = userId;
    if (entityType) filter.entityType = entityType;
    if (entityId) filter.entityId = entityId;

    const views = await View.find(filter).sort({ createdAt: -1 });
    res.json({ views });
  } catch (e) {
    next(e);
  }
}

module.exports = { track, list };
