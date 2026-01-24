// student.agreements.page.js
// Student: list my agreements + cancel if PENDING

import { listAgreements, cancelAgreement } from "../services/agreements.api.js";
import { toast } from "../ui/components.js";

export function initStudentAgreementsPage() {
  const tableWrap = document.getElementById("agreementsTableWrap"); // ✅ coincide con HTML
  const btnReload = document.getElementById("btnReloadAgreements"); // ✅ coincide con HTML

  btnReload.addEventListener("click", () => load());
  load();

  async function load() {
    tableWrap.innerHTML = `<div class="card card-pad">Loading agreements...</div>`;

    try {
      const data = await listAgreements();
      const items = data.agreements || [];

      if (!items.length) {
        tableWrap.innerHTML = `<div class="card card-pad">No agreements found.</div>`;
        return;
      }

      tableWrap.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>PlaceId</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(row).join("")}
          </tbody>
        </table>
      `;

      document.querySelectorAll("[data-cancel]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.cancel;
          btn.disabled = true;
          try {
            await cancelAgreement(id);
            toast({ title: "Cancelled", message: "Agreement was cancelled." });
            load();
          } catch (err) {
            toast({ title: "Error", message: err.message });
          } finally {
            btn.disabled = false;
          }
        });
      });

    } catch (err) {
      tableWrap.innerHTML = `<div class="card card-pad">Failed to load: ${escapeHtml(err.message)}</div>`;
    }
  }
}

function row(a) {
  const status = a.status || "PENDING";
  const badgeClass =
    status === "APPROVED" ? "success" :
    status === "REJECTED" ? "danger" :
    status === "CANCELLED" ? "warn" : "";

  const canCancel = status === "PENDING";

  return `
    <tr>
      <td><span class="badge ${badgeClass}">${escapeHtml(status)}</span></td>
      <td class="kbd">${escapeHtml(a.placeId)}</td>
      <td>${escapeHtml(new Date(a.createdAt).toLocaleString())}</td>
      <td>
        ${canCancel ? `<button class="btn btn-danger" data-cancel="${escapeHtml(a._id)}">Cancel</button>` : "-"}
      </td>
    </tr>
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
