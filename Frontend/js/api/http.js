import { CONFIG } from "../config.js";
import { getToken, clearSession } from "../store/session.js";

export async function http(path, options = {}) {
  const url = `${CONFIG.API_BASE_URL}${path}`;

  const token = getToken();
  const headers = { ...(options.headers || {}) };

  // If body is NOT FormData, default to JSON content-type (when not provided)
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) clearSession();
    const message = data?.error || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
