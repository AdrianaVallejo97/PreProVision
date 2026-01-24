// app.js
// App bootstrap: router + page controllers

import { resolveRoute, loadPageInto } from "./router.js";
import { getRole } from "./store/session.js";
import { renderLayout, wireLayoutEvents } from "./ui/layout.js";
import { toast, loaderHTML } from "./ui/components.js";

// Controllers
import { initLoginPage } from "./pages/login.page.js";

// Student
import { initStudentPlacesPage } from "./pages/student.places.page.js";
import { initStudentAgreementsPage } from "./pages/student.agreements.page.js";
import { initStudentDocumentsPage } from "./pages/student.documents.page.js";
import { initStudentNotificationsPage } from "./pages/student.requests.page.js"; // optional

// Admin
import { initAdminAgreementsPage } from "./pages/admin.agreements.page.js";
import { initAdminUsersPage } from "./pages/admin.users.page.js";
import { initAdminDocumentsPage } from "./pages/admin.documents.page.js";
import { initAdminReportsPage } from "./pages/admin.reports.page.js";
import { initAdminPlacesPage } from "./pages/admin.places.page.js";

const app = document.getElementById("app");

window.addEventListener("hashchange", () => render());
window.addEventListener("offline", () => (location.hash = "#/offline"));

render();

async function render() {
  try {
    const hash = location.hash || "#/login";
    app.innerHTML = loaderHTML("Loading page");

    const route = await resolveRoute(hash);
    if (!route.ok) {
      location.hash = route.redirect;
      return;
    }

    // Public
    if (route.guard === "public") {
      await loadPageInto(app, route.page);
      runPublicPageController(hash);
      return;
    }

    // Protected layout wrap
    const temp = document.createElement("div");
    await loadPageInto(temp, route.page);

    const section = temp.querySelector("section[data-title]");
    const title = section?.dataset?.title || "Dashboard";

    app.innerHTML = renderLayout({ title, contentHTML: temp.innerHTML });
    wireLayoutEvents();

    runProtectedPageController(hash);

  } catch (err) {
    console.error(err);
    toast({ title: "Error", message: err.message || "Unexpected error" });
    location.hash = "#/error";
  }
}

function runPublicPageController(hash) {
  if (hash === "#/login") initLoginPage();
}

function runProtectedPageController(hash) {
  const role = getRole();

  // STUDENT
  if (role === "STUDENT") {
    if (hash === "#/student/places") initStudentPlacesPage();
    if (hash === "#/student/my-agreements") initStudentAgreementsPage();
    if (hash === "#/student/my-documents") initStudentDocumentsPage();
    if (hash === "#/student/notifications") initStudentNotificationsPage();
  }

  // ADMIN
  if (role === "ADMIN") {
    if (hash === "#/admin/agreements") initAdminAgreementsPage();
    if (hash === "#/admin/users") initAdminUsersPage();
    if (hash === "#/admin/documents") initAdminDocumentsPage();
    if (hash === "#/admin/reports") initAdminReportsPage();
    if (hash === "#/admin/places") initAdminPlacesPage();
     }
}
