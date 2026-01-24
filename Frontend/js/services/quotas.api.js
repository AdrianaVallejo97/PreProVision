import { http } from "./http.js";

export function getQuota(placeId) {
  return http(`/quotas/${encodeURIComponent(placeId)}`, { method: "GET" });
}
