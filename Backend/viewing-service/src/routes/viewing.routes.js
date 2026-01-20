const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../utils/validate");
const { requireInternalKey } = require("../middlewares/internalKey.middleware");
const ctrl = require("../controllers/viewing.controller");

const router = express.Router();

router.post(
  "/track",
  requireInternalKey,
  [
    body("userId").isString(),
    body("entityType").isIn(["DOCUMENT", "PLACE", "AGREEMENT"]),
    body("entityId").isString(),
    body("metadata").optional().isObject(),
    validate
  ],
  ctrl.track
);

router.get("/", requireInternalKey, ctrl.list);

module.exports = { viewingRouter: router };
