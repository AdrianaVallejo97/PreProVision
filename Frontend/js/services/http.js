import { CONFIG } from "../config.js";
import { getToken, clearSession } from "../store/session.js";

export async function http(path, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${path}`;

  const token = getToken();
  const headers = { ...(options.headers || {}) };

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  // Solo setear JSON header si NO es FormData
  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : await res.text().catch(() => "");

  if (!res.ok) {
    if (res.status === 401) clearSession();
    const message =
      (data && typeof data === "object" && data.error) ? data.error :
      (typeof data === "string" && data) ? data :
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
