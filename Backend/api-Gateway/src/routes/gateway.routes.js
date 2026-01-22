// Backend/api-Gateway/src/routes/gateway.routes.js
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { apiLimiter } = require("../middlewares/rateLimit.middleware");
const { requireAuth } = require("../middlewares/auth.middleware");
const { requireInternalKey } = require("../middlewares/internalKey.middleware");

const router = express.Router();

function proxyTo(target, extra = {}) {
  const { onProxyReq: extraOnProxyReq, ...rest } = extra;

  return createProxyMiddleware({
    target,
    changeOrigin: true,
    xfwd: true,
    logLevel: "warn",
    proxyTimeout: 30000,
    timeout: 30000,
    ...rest,

    onProxyReq(proxyReq, req, res) {
      // Forward user context
      if (req.user) {
        proxyReq.setHeader("x-user-id", req.user.userId || "");
        proxyReq.setHeader("x-user-role", req.user.roleName || "");
        proxyReq.setHeader("x-user-email", req.user.email || "");
      }

      // Re-inject JSON body (porque express.json() ya lo consumió)
      if (
        req.body &&
        Object.keys(req.body).length > 0 &&
        req.headers["content-type"]?.includes("application/json")
      ) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }

      if (typeof extraOnProxyReq === "function") {
        extraOnProxyReq(proxyReq, req, res);
      }
    },

    onError(err, req, res) {
      console.error("Proxy error:", err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: "Bad gateway", details: err.message });
      }
    }
  });
}

function mount(prefix, target, middlewares = []) {
  router.use(
    prefix,
    ...middlewares,
    proxyTo(target, {
      // ✅ vuelve a agregar el prefijo que Express recorta
      pathRewrite: (path) => `${prefix}${path}`
    })
  );
}

// =========================
// GLOBAL
// =========================
router.use(apiLimiter);

// =========================
// HEALTH
// =========================
router.get("/health", (req, res) => {
  res.json({ status: "UP", service: "api-gateway" });
});

// =========================
// PUBLIC
// =========================
mount("/auth", process.env.AUTH_SERVICE_URL);     // -> /auth/login
mount("/places", process.env.PLACES_SERVICE_URL); // -> /places, /places/:id

// Monitoring (tu monitoring está en "/")
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

// =========================
// PROTECTED (JWT)
// =========================
mount("/agreements", process.env.AGREEMENTS_SERVICE_URL, [requireAuth]);
mount("/quotas", process.env.QUOTAS_SERVICE_URL, [requireAuth]);
mount("/documents", process.env.DOCUMENTS_SERVICE_URL, [requireAuth]);

// =========================
// INTERNAL (x-internal-key)
// =========================
mount("/internal", process.env.USER_SERVICE_URL, [requireInternalKey]);
mount("/internal/cache", process.env.CACHE_SERVICE_URL, [requireInternalKey]);
mount("/internal/notifications", process.env.NOTIFICATIONS_SERVICE_URL, [requireInternalKey]);
mount("/internal/viewing", process.env.VIEWING_SERVICE_URL, [requireInternalKey]);

module.exports = { gatewayRouter: router };
