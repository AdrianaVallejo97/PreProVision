const Notification = require("../models/Notification");

async function create(req, res, next) {
  try {
    const notification = await Notification.create({
      type: req.body.type,
      recipient: req.body.recipient,
      message: req.body.message
    });

    res.status(201).json({ notification });
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (e) {
    next(e);
  }
}

module.exports = { create, list };
