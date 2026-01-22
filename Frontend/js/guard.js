import { getToken, getUser, clearSession } from "./storage.js";

// Basic route protection (token + user required, optional role)
export function requireAuth({ role } = {}) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    clearSession();
    window.location.href = "/public/index.html";
    return;
  }

  if (role && user.roleName !== role) {
    window.location.href = "/public/unauthorized.html";
  }
}
