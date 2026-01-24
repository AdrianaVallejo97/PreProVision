import { http } from "./http.js";

/**
 * Requiere backend REAL:
 * GET /users (ADMIN)
 * POST /users (ADMIN)
 * PATCH /users/:id (ADMIN)
 * DELETE /users/:id (ADMIN)
 */
export function listUsers() {
  return http("/users", { method: "GET" });
}

export function createUser(payload) {
  return http("/users", { method: "POST", body: JSON.stringify(payload) });
}

export function updateUser(id, payload) {
  return http(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteUser(id) {
  return http(`/users/${id}`, { method: "DELETE" });
}
