const express = require("express");
const { body, param } = require("express-validator");
const { validate } = require("../utils/validate");
const { internalKey } = require("../middlewares/internalKey.middleware");
const { client } = require("../config/redis");

const router = express.Router();

/**
 * Rutas internas (solo microservicios)
 * Header requerido:
 *  x-internal-key: <INTERNAL_API_KEY>
 */

// GET /internal/cache/:key
router.get("/cache/:key", internalKey, [param("key").isString(), validate], async (req, res, next) => {
  try {
    const value = await client.get(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (e) {
    next(e);
  }
});

// POST /internal/cache (set)
router.post(
  "/cache",
  internalKey,
  [
    body("key").isString().isLength({ min: 1 }),
    body("value").exists(),
    body("ttlSeconds").optional().isInt({ min: 1 }),
    validate
  ],
  async (req, res, next) => {
    try {
      const { key, value, ttlSeconds } = req.body;

      const payload = typeof value === "string" ? value : JSON.stringify(value);

      if (ttlSeconds) {
        await client.setEx(key, Number(ttlSeconds), payload);
      } else {
        await client.set(key, payload);
      }

      res.status(201).json({ ok: true, key });
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /internal/cache/:key
router.delete("/cache/:key", internalKey, [param("key").isString(), validate], async (req, res, next) => {
  try {
    await client.del(req.params.key);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = { cacheRouter: router };
