import { CONFIG } from "./config.js";

// Save JWT token
export function setToken(token) {
  localStorage.setItem(CONFIG.STORAGE.TOKEN_KEY, token);
}

// Read JWT token
export function getToken() {
  return localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
}

// Save user payload (role, email, etc.)
export function setUser(user) {
  localStorage.setItem(CONFIG.STORAGE.USER_KEY, JSON.stringify(user || null));
}

// Read user payload
export function getUser() {
  const raw = localStorage.getItem(CONFIG.STORAGE.USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Clear session storage
export function clearSession() {
  localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
  localStorage.removeItem(CONFIG.STORAGE.USER_KEY);
}
