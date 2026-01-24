// auth.api.js
// Auth API calls via API Gateway

import { http } from "./http.js";

export function login(email, password) {
  return http("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function me() {
  return http("/auth/me", {
    method: "GET"
  });
}
