// admin.places.page.js
import { listPlaces, createPlace, updatePlace, closePlace, deletePlace } from "../services/places.api.js";
import { toast } from "../ui/components.js";
import { getQuota } from "../services/quotas.api.js";


let loading = false;

export function initAdminPlacesPage() {
  const wrap = document.getElementById("placesAdminTableWrap");
  const btnReload = document.getElementById("btnReloadPlacesAdmin");
  const search = document.getElementById("placeSearch");

  const formWrap = document.getElementById("placeFormWrap");
  const btnToggleForm = document.getElementById("btnTogglePlaceForm");
  const btnCancelForm = document.getElementById("btnCancelPlaceForm");

  const form = document.getElementById("placeForm");
  const placeHint = document.getElementById("placeHint");

  const placeId = document.getElementById("placeId");
  const name = document.getElementById("name");
  const description = document.getElementById("description");
  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const capacity = document.getElementById("capacity");
  const status = document.getElementById("status");

  const btnReset = document.getElementById("btnResetPlace");
  const btnSave = document.getElementById("btnSavePlace");

  // ✅ Anti doble bind: ANTES de cualquier listener
  if (btnReload.dataset.bound === "1") return;
  btnReload.dataset.bound = "1";

  let allPlaces = [];

  // Toggle form open/close
  btnToggleForm.addEventListener("click", () => {
    const willOpen = formWrap.classList.contains("hidden");
    formWrap.classList.toggle("hidden");
    btnToggleForm.textContent = willOpen ? "Hide form" : "Create place";
    if (!willOpen) resetForm();
    if (willOpen) window.scrollTo({ top: 0, behavior: "smooth" });
  });

  btnCancelForm.addEventListener("click", () => {
    formWrap.classList.add("hidden");
    btnToggleForm.textContent = "Create place";
    resetForm();
  });

  btnReload.addEventListener("click", () => load());
  search.addEventListener("input", () => renderTable());
  btnReset.addEventListener("click", () => resetForm());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: name.value.trim(),
      description: (description.value || "").trim(),
      startDate: startDate.value,
      endDate: endDate.value,
      capacity: Number(capacity.value),
      status: status.value
    };

    if (!payload.name || payload.name.length < 3) {
      toast({ title: "Validation", message: "Name must have at least 3 characters." });
      return;
    }
    if (!payload.startDate || !payload.endDate) {
      toast({ title: "Validation", message: "Start date and End date are required." });
      return;
    }
    if (!Number.isFinite(payload.capacity) || payload.capacity < 0) {
      toast({ title: "Validation", message: "Capacity must be 0 or greater." });
      return;
    }

    btnSave.disabled = true;

    try {
      if (placeId.value) {
        await updatePlace(placeId.value, payload);
        toast({ title: "Updated", message: "Place updated." });
      } else {
        await createPlace(payload);
        toast({ title: "Created", message: "Place created." });
      }

      resetForm();
      await load();
    } catch (err) {
      toast({ title: "Error", message: err.message });
    } finally {
      btnSave.disabled = false;
    }
  });

  load();

async function load() {
  if (loading) return;
  loading = true;

  wrap.innerHTML = `<div class="card card-pad">Loading places...</div>`;
  try {
    const res = await listPlaces();
    allPlaces = res.places || [];

    // ✅ Traer quotas por place (best-effort)
    const quotaMap = new Map();

    await Promise.all(
      allPlaces.map(async (p) => {
        try {
          const q = await getQuota(p._id); // { quota: {capacity, used, available} }
          quotaMap.set(String(p._id), q.quota);
        } catch {
          // si no existe quota aún, lo dejamos vacío
        }
      })
    );

    renderTable(quotaMap);
  } catch (err) {
    wrap.innerHTML = `<div class="card card-pad">Failed: ${escapeHtml(err.message)}</div>`;
  } finally {
    loading = false;
  }
}

  function renderTable(quotaMap = new Map()) {
    const q = (search.value || "").trim().toLowerCase();
    const items = !q ? allPlaces : allPlaces.filter(p => String(p.name || "").toLowerCase().includes(q));

    if (!items.length) {
      wrap.innerHTML = `<div class="card card-pad">No places found.</div>`;
      return;
    }

    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Start</th>
            <th>End</th>
            <th>Capacity</th>
            <th>Used</th>
            <th>Available</th>
            <th style="width:320px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(p => row(p, quotaMap)).join("")}
        </tbody>
      </table>
    `;

    // Edit
    wrap.querySelectorAll("[data-edit-place]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.editPlace;
        const p = allPlaces.find(x => x._id === id);
        if (!p) return;

        placeId.value = p._id;
        name.value = p.name || "";
        description.value = p.description || "";
        capacity.value = p.capacity ?? 0;
        status.value = p.status || "OPEN";
        startDate.value = toDateInputValue(p.startDate);
        endDate.value = toDateInputValue(p.endDate);

        placeHint.textContent = `Editing: ${p.name}`;

        // ✅ abrir form al editar
        formWrap.classList.remove("hidden");
        btnToggleForm.textContent = "Hide form";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    // Close
    wrap.querySelectorAll("[data-close-place]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.closePlace;
        if (!confirm("Close this place? (It will be CLOSED)")) return;

        btn.disabled = true;
        try {
          await closePlace(id);
          toast({ title: "Closed", message: "Place closed." });
          await load();
        } catch (err) {
          toast({ title: "Error", message: err.message });
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Delete
    wrap.querySelectorAll("[data-del-place]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.delPlace;
        if (!confirm("Delete this place permanently?")) return;

        btn.disabled = true;
        try {
          await deletePlace(id);
          toast({ title: "Deleted", message: "Place deleted." });
          await load();
        } catch (err) {
          toast({ title: "Error", message: err.message });
        } finally {
          btn.disabled = false;
        }
      });
    });

    // Docs
    wrap.querySelectorAll("[data-docs-place]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.docsPlace;
        sessionStorage.setItem("ppv_docs_kind", "PLACE");
        sessionStorage.setItem("ppv_docs_entity", id);
        location.hash = "#/admin/documents";
      });
    });
  }

  function row(p, quotaMap) {
  const st = p.status || "OPEN";
  const badgeClass = st === "OPEN" ? "success" : "warn";
  const canClose = st === "OPEN";

  const q = quotaMap.get(String(p._id)) || null;
  const used = q ? q.used : "—";
  const available = q ? q.available : "—";

  return `
    <tr>
      <td>${escapeHtml(p.name || "")}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(st)}</span></td>
      <td>${escapeHtml(formatDate(p.startDate))}</td>
      <td>${escapeHtml(formatDate(p.endDate))}</td>
      <td class="kbd">${escapeHtml(String(p.capacity ?? 0))}</td>
      <td class="kbd">${escapeHtml(String(used))}</td>
      <td class="kbd">${escapeHtml(String(available))}</td>
      <td>
        <button class="btn" data-edit-place="${escapeHtml(p._id)}">Edit</button>
        ${canClose ? `<button class="btn btn-danger" data-close-place="${escapeHtml(p._id)}">Close</button>` : "-"}
        <button class="btn btn-danger" data-del-place="${escapeHtml(p._id)}">Delete</button>
        <button class="btn btn-primary" data-docs-place="${escapeHtml(p._id)}">Docs</button>
      </td>
    </tr>
  `;
}


  function resetForm() {
    placeId.value = "";
    name.value = "";
    description.value = "";
    startDate.value = "";
    endDate.value = "";
    capacity.value = "0";
    status.value = "OPEN";
    placeHint.textContent = "Create a new place or click “Edit”.";
  }
}

function toDateInputValue(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = String(dt.getFullYear());
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString();
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
