const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireInternalKey } = require("../middlewares/internalKey.middleware");

const router = express.Router();

function proxyTo(target, extra = {}) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    logLevel: "warn",
    ...extra,
    onProxyReq(proxyReq, req) {
      // forward token y user context si existe
      if (req.user) {
        proxyReq.setHeader("x-user-id", req.user.userId || "");
        proxyReq.setHeader("x-user-role", req.user.roleName || "");
        proxyReq.setHeader("x-user-email", req.user.email || "");
      }
      if (extra.onProxyReq) extra.onProxyReq(proxyReq, req);
    }
  });
}

// Rate limit global
router.use(apiLimiter);

// Health del Gateway
router.get("/health", (req, res) => {
  res.json({ status: "UP", service: "api-gateway" });
});

/* =========================
   PUBLIC
   ========================= */

// AUTH (login y /me se manejan por auth-service, pero /me requiere token en auth-service)
router.use("/auth", proxyTo(process.env.AUTH_SERVICE_URL));

// PLACES (tu places-service: GET público)
router.get("/places", proxyTo(process.env.PLACES_SERVICE_URL));
router.get("/places/:id", proxyTo(process.env.PLACES_SERVICE_URL));

/* MONITORING (tu monitoring-service está montado en "/") */
router.get(
  "/monitoring/metrics",
  proxyTo(process.env.MONITORING_SERVICE_URL, {
    pathRewrite: { "^/monitoring/metrics": "/metrics" }
  })
);

router.get(
  "/monitoring/health",
  proxyTo(process.env.MONITORING_SERVICE_URL, {
    pathRewrite: { "^/monitoring/health": "/health" }
  })
);

/* =========================
   PROTECTED (JWT)
   ========================= */

// AGREEMENTS: agreements-service monta app.use("/agreements", agreementsRouter)
router.use("/agreements", requireAuth, proxyTo(process.env.AGREEMENTS_SERVICE_URL));

// QUOTAS
router.use("/quotas", requireAuth, proxyTo(process.env.QUOTAS_SERVICE_URL));

// DOCUMENTS
router.use("/documents", requireAuth, proxyTo(process.env.DOCUMENTS_SERVICE_URL));

// PLACES admin (POST/PUT/PATCH) protegidos
router.post("/places", requireAuth, proxyTo(process.env.PLACES_SERVICE_URL));
router.put("/places/:id", requireAuth, proxyTo(process.env.PLACES_SERVICE_URL));
router.patch("/places/:id/close", requireAuth, proxyTo(process.env.PLACES_SERVICE_URL));

/* =========================
   INTERNAL (microservicios)
   =========================
   user-service:   /internal/auth/verify
   cache-service:  /internal/cache/...
   notifications:  /internal/notifications/...
   viewing:        /internal/viewing/...
*/

router.use("/internal", requireInternalKey, proxyTo(process.env.USER_SERVICE_URL));
router.use("/internal/cache", requireInternalKey, proxyTo(process.env.CACHE_SERVICE_URL));
router.use("/internal/notifications", requireInternalKey, proxyTo(process.env.NOTIFICATIONS_SERVICE_URL));
router.use("/internal/viewing", requireInternalKey, proxyTo(process.env.VIEWING_SERVICE_URL));

module.exports = { gatewayRouter: router };
