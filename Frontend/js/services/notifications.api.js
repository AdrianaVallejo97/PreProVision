import { http } from "./http.js";

/**
 * Si creas backend:
 * POST /notifications/whatsapp (auth) -> envía notificación
 */
export function sendWhatsappTest() {
  return http("/notifications/whatsapp", { method: "POST", body: JSON.stringify({ test: true }) });
}
