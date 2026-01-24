// admin.agreements.page.js
// Admin: list all agreements + approve/reject
import { listAgreements, approveAgreement, rejectAgreement } from "../services/agreements.api.js";
import { toast } from "../ui/components.js";

export function initAdminAgreementsPage() {
  const tableWrap = document.getElementById("adminAgreementsWrap");
  const btnReload = document.getElementById("btnReloadAdminAgreements");

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
              <th>UserId</th>
              <th>PlaceId</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(row).join("")}
          </tbody>
        </table>
      `;

      document.querySelectorAll("[data-approve]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.approve;
          btn.disabled = true;
          try {
            await approveAgreement(id);
            toast({ title: "Approved", message: "Agreement approved." });
            load();
          } catch (err) {
            toast({ title: "Error", message: err.message });
          } finally {
            btn.disabled = false;
          }
        });
      });

      document.querySelectorAll("[data-reject]").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.reject;
          btn.disabled = true;
          try {
            await rejectAgreement(id);
            toast({ title: "Rejected", message: "Agreement rejected." });
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

  const canAct = status === "PENDING";

  return `
    <tr>
      <td class="kbd">${escapeHtml(a.userId)}</td>
      <td class="kbd">${escapeHtml(a.placeId)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(status)}</span></td>
      <td>${escapeHtml(new Date(a.createdAt).toLocaleString())}</td>
      <td>
        ${canAct ? `
          <button class="btn btn-success" data-approve="${escapeHtml(a._id)}">Approve</button>
          <button class="btn btn-danger" data-reject="${escapeHtml(a._id)}">Reject</button>
        ` : "-"}
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
