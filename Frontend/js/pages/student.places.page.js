// student.places.page.js
import { listPlaces } from "../services/places.api.js";
import { listAgreements, createAgreement } from "../services/agreements.api.js";
import { toast } from "../ui/components.js";
import { trackView } from "../services/viewing.api.js";

let loading = false;

export function initStudentPlacesPage() {
  const listEl = document.getElementById("placesList");
  const btnReload = document.getElementById("btnReloadPlaces");

  if (btnReload.dataset.bound === "1") return;
  btnReload.dataset.bound = "1";

  btnReload.addEventListener("click", () => load());
  load();

  async function load() {
    if (loading) return;
    loading = true;

    listEl.innerHTML = `<div class="card card-pad">Loading places...</div>`;

    try {
      const [placesRes, agRes] = await Promise.all([listPlaces(), listAgreements()]);
      const places = placesRes.places || [];
      const agreements = agRes.agreements || [];

      // ✅ Regla: solo 1 postulación activa global
      const hasActive = agreements.some(a => a.status === "PENDING" || a.status === "APPROVED");
      const activeMsg = "You already have an active application (PENDING/APPROVED).";

      if (!places.length) {
        listEl.innerHTML = `<div class="card card-pad">No places available.</div>`;
        return;
      }

      listEl.innerHTML = places.map(p => placeCard(p, hasActive, activeMsg)).join("");

      // Track view lista
      try { await trackView("PLACE", "list", { action: "list_view" }); } catch {}

      // Wire Apply
      document.querySelectorAll("[data-apply]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const placeId = btn.dataset.apply;

          // ✅ Bloqueo
          if (hasActive) {
            toast({ title: "Blocked", message: activeMsg });
            return;
          }

          btn.disabled = true;

          try { await trackView("PLACE", placeId, { action: "apply_click" }); } catch {}

          try {
            await createAgreement(placeId);
            toast({ title: "Request sent", message: "Agreement request created (PENDING)." });
            load();
          } catch (err) {
            toast({ title: "Error", message: err.message });
            btn.disabled = false;
          }
        });
      });

    } catch (err) {
      listEl.innerHTML = `<div class="card card-pad">Failed: ${escapeHtml(err.message)}</div>`;
    } finally {
      loading = false;
    }
  }
}

function placeCard(p, hasActive, activeMsg) {
  const disabledAttr = hasActive ? "disabled" : "";

  const note = hasActive
    ? `<span class="badge warn">${escapeHtml(activeMsg)}</span>`
    : "";

  return `
    <div class="card card-pad" style="margin-bottom: 12px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
        <div>
          <p class="h1" style="margin:0;">${escapeHtml(p.name || "Place")}</p>
          <p class="h2" style="margin:6px 0 0 0;">${escapeHtml(p.description || "")}</p>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <span class="badge">${escapeHtml(p.status || "OPEN")}</span>
            <span class="badge">Capacity: ${escapeHtml(p.capacity ?? 0)}</span>
            ${note}
          </div>
        </div>
        <button class="btn btn-primary" ${disabledAttr} data-apply="${escapeHtml(p._id)}">
          ${hasActive ? "Blocked" : "Apply"}
        </button>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
