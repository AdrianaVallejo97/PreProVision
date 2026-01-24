// session.js
// Session storage helpers (token + user) using localStorage

import { CONFIG } from "../config.js";

export function setSession({ token, user }) {
  localStorage.setItem(CONFIG.STORAGE_TOKEN_KEY, token);
  localStorage.setItem(CONFIG.STORAGE_USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(CONFIG.STORAGE_TOKEN_KEY);
  localStorage.removeItem(CONFIG.STORAGE_USER_KEY);
}

export function getToken() {
  return localStorage.getItem(CONFIG.STORAGE_TOKEN_KEY) || null;
}

export function getUser() {
  const raw = localStorage.getItem(CONFIG.STORAGE_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function isLoggedIn() {
  return !!getToken();
}

export function getRole() {
  const u = getUser();
  return u?.roleName || null;
}
