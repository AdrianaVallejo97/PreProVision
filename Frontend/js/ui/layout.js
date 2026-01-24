// layout.js
// Layout builder with role-based sidebar
import { clearSession, getUser, getRole } from "../store/session.js";

export function renderLayout({ title = "Dashboard", contentHTML = "" } = {}) {
  const user = getUser();
  const role = getRole();

  const links = role === "ADMIN"
    ? [
        { href: "#/admin/dashboard", label: "Admin Dashboard" },
        { href: "#/admin/users", label: "Users" },
        { href: "#/admin/places", label: "Places" },
        { href: "#/admin/agreements", label: "Agreements" },
        { href: "#/admin/documents", label: "Documents" },
        { href: "#/admin/reports", label: "Reports" }
      ]
    : [
        { href: "#/student/dashboard", label: "Dashboard" },
        { href: "#/student/places", label: "Places" },
        { href: "#/student/my-agreements", label: "My Agreements" },
        { href: "#/student/my-documents", label: "My Documents" }
      ];

  return `
    <div class="app-layout" id="appLayout">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-logo">
            <img src="./assets/img/logo.png" alt="Logo" onerror="this.style.display='none'" />
          </div>
          <div>
            <div class="brand-name">PreProVision</div>
            <div class="brand-sub">${role || "GUEST"}</div>
          </div>
        </div>

        <nav class="nav">
          ${links.map(l => `<a href="${l.href}" data-nav>${l.label}</a>`).join("")}
        </nav>

        <div style="margin-top: 18px;">
          <button class="btn" id="btnLogout">Logout</button>
        </div>
      </aside>

      <main class="main">
        <div class="topbar">
          <div style="display:flex;gap:10px;align-items:center;">
            <button class="btn" id="btnToggleSidebar" aria-label="Toggle sidebar">☰</button>
            <div>
              <p class="page-title">${escapeHtml(title)}</p>
              <p class="page-sub">Welcome, ${escapeHtml(user?.name || user?.email || "User")}.</p>
            </div>
          </div>

          <div class="who">
            <span class="kbd">${escapeHtml(user?.email || "")}</span>
          </div>
        </div>

        ${contentHTML}
      </main>
    </div>
  `;
}

export function wireLayoutEvents() {
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      clearSession();
      location.hash = "#/login";
    });
  }

  const btnToggle = document.getElementById("btnToggleSidebar");
  const layout = document.getElementById("appLayout");
  if (btnToggle && layout) {
    btnToggle.addEventListener("click", () => {
      layout.classList.toggle("sidebar-collapsed");
    });
  }

  // Highlight active link
  const current = location.hash || "#/login";
  document.querySelectorAll("[data-nav]").forEach(a => {
    if (a.getAttribute("href") === current) a.classList.add("active");
  });
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
