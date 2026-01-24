// router.js
// Hash router with simple guards for auth + role
// router.js
import { isLoggedIn, getRole } from "./store/session.js";

export const ROUTES = {
  // Public
  "#/login": { page: "/pages/auth/login.html", guard: "public" },
  "#/offline": { page: "/pages/common/offline.html", guard: "public" },
  "#/error": { page: "/pages/common/error.html", guard: "public" },
  "#/404": { page: "/pages/common/not-found.html", guard: "public" },
  "#/403": { page: "/pages/auth/forbidden.html", guard: "public" },

  // Student
  "#/student/dashboard": { page: "/pages/student/dashboard.html", guard: "student" },
  "#/student/places": { page: "/pages/student/places.html", guard: "student" },
  "#/student/my-agreements": { page: "/pages/student/my-agreements.html", guard: "student" },
  "#/student/my-documents": { page: "/pages/student/my-documents.html", guard: "student" },
  "#/student/notifications": { page: "/pages/student/notifications.html", guard: "student" },

  // Admin
  "#/admin/dashboard": { page: "/pages/admin/dashboard.html", guard: "admin" },
  "#/admin/users": { page: "/pages/admin/users.html", guard: "admin" },
  "#/admin/places": { page: "/pages/admin/places.html", guard: "admin" },
  "#/admin/agreements": { page: "/pages/admin/agreements.html", guard: "admin" },
  "#/admin/documents": { page: "/pages/admin/documents.html", guard: "admin" },
  "#/admin/reports": { page: "/pages/admin/reports.html", guard: "admin" },
};

export async function resolveRoute(hash) {
  const route = ROUTES[hash] || null;
  if (!route) return { ok: false, redirect: "#/404" };

  if (route.guard === "public") return { ok: true, ...route };
  if (!isLoggedIn()) return { ok: false, redirect: "#/login" };

  const role = getRole();
  if (route.guard === "student" && role !== "STUDENT") return { ok: false, redirect: "#/403" };
  if (route.guard === "admin" && role !== "ADMIN") return { ok: false, redirect: "#/403" };

  return { ok: true, ...route };
}

export async function loadPageInto(container, pagePath) {
  const res = await fetch(pagePath, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load page: ${pagePath}`);
  const html = await res.text();
  container.innerHTML = html;
}
