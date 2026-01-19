const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../utils/validate");
const { requireInternalKey } = require("../middlewares/internalKey.middleware");
const ctrl = require("../controllers/notifications.controller");

const router = express.Router();

router.post(
  "/",
  requireInternalKey,
  [
    body("type").isString(),
    body("recipient").isString(),
    body("message").isString(),
    validate
  ],
  ctrl.create
);

router.get("/", requireInternalKey, ctrl.list);

module.exports = { notificationsRouter: router };
