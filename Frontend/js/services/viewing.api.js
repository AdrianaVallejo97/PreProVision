import { http } from "./http.js";

export function trackView(entityType, entityId, metadata = {}) {
  return http("/viewing/track", {
    method: "POST",
    body: JSON.stringify({ entityType, entityId, metadata })
  });
}
