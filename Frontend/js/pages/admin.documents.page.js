// Frontend/js/pages/admin.documents.page.js
import { uploadDocument, listDocumentsBy, getSignedUrl } from "../services/documents.api.js";
import { listUsers } from "../services/users.api.js";
import { listApprovedUsersByPlace } from "../services/agreements.api.js";
import { trackView } from "../services/viewing.api.js";
import { toast } from "../ui/components.js";

export function initAdminDocumentsPage() {
  const form = document.getElementById("docUploadForm");
  const kind = document.getElementById("docKind");
  const entityId = document.getElementById("docEntityId");
  const file = document.getElementById("docFile");
  const btnUpload = document.getElementById("btnUploadDoc");

  const listEl = document.getElementById("docsAdminList");
  const btnReload = document.getElementById("btnReloadDocsAdmin");

  const targetWrap = document.getElementById("targetUserWrap");
  const targetSelect = document.getElementById("docTargetUserId");
  const targetHint = document.getElementById("targetUserHint");

  const btnCancel = document.getElementById("btnCancelDoc");
  btnCancel?.addEventListener("click", () => (location.hash = "#/admin/dashboard"));

  // Prefill from Places "Docs"
  const savedKind = sessionStorage.getItem("ppv_docs_kind");
  const savedEntity = sessionStorage.getItem("ppv_docs_entity");
  if (savedKind && savedEntity) {
    kind.value = savedKind;
    entityId.value = savedEntity;
    sessionStorage.removeItem("ppv_docs_kind");
    sessionStorage.removeItem("ppv_docs_entity");
  }

  // Avoid double bind
  if (form.dataset.bound === "1") return;
  form.dataset.bound = "1";

  let usersCache = [];
  const usersById = new Map();

  btnReload?.addEventListener("click", () => loadList());

  entityId.addEventListener(
    "input",
    debounce(async () => {
      await loadUsersIfNeeded();
      loadList();
    }, 450)
  );

  kind.addEventListener("change", async () => {
    toggleTarget();
    await loadUsersIfNeeded();
    loadList();
  });

  targetSelect?.addEventListener("change", () => {
    const u = usersById.get(targetSelect.value);
    targetHint.textContent = u ? `Selected: ${u.name}` : "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const k = kind.value;
    const id = entityId.value.trim();
    const studentId = (targetSelect?.value || "").trim();

    if (!id) return toast({ title: "Validation", message: "Place/Agreement ID required." });
    if (!file.files?.[0]) return toast({ title: "Validation", message: "Choose a file." });

    if (k === "AGREEMENT" && !studentId) {
      return toast({ title: "Validation", message: "Select an APPROVED student for this place." });
    }

    btnUpload.disabled = true;
    btnUpload.textContent = "Uploading...";

    try {
      const res = await uploadDocument({
        file: file.files[0],
        kind: k,
        entityId: id,
        targetUserId: k === "AGREEMENT" ? studentId : ""
      });

      toast({ title: "Uploaded", message: res?.message || "Document uploaded." });
      file.value = "";
      await loadList();
    } catch (err) {
      toast({ title: "Error", message: err.message });
    } finally {
      btnUpload.disabled = false;
      btnUpload.textContent = "Upload";
    }
  });

  toggleTarget();
  loadUsersIfNeeded();
  loadList();

  async function loadUsersIfNeeded() {
    if (!targetWrap || !targetSelect) return;
    if (kind.value !== "AGREEMENT") return;

    if (!usersCache.length) {
      targetHint.textContent = "Loading students...";
      try {
        const res = await listUsers();
        const all = res.users || [];
        usersCache = all.filter((u) => u.roleName === "STUDENT" && u.status !== "DISABLED");
        usersCache.forEach((u) => usersById.set(u.userId, u));
      } catch {
        targetHint.textContent = "Could not load users. Check /users endpoint.";
        return;
      }
    }

    const placeId = entityId.value.trim();
    if (!placeId) {
      targetSelect.innerHTML = `<option value="">Enter Place ID first...</option>`;
      targetHint.textContent = "Enter a Place ID to load approved students.";
      return;
    }

    targetHint.textContent = "Loading approved students...";

    try {
      const r = await listApprovedUsersByPlace(placeId);
      const approvedIds = new Set(r.userIds || []);
      const approvedStudents = usersCache.filter((u) => approvedIds.has(u.userId));

      targetSelect.innerHTML = `
        <option value="">Select approved student...</option>
        ${approvedStudents
          .map(
            (u) =>
              `<option value="${escapeHtml(u.userId)}">${escapeHtml(u.name)} — ${escapeHtml(u.email)}</option>`
          )
          .join("")}
      `;

      targetHint.textContent = approvedStudents.length ? "" : "No approved students for this place yet.";
    } catch {
      targetHint.textContent = "Could not load approved students for this place.";
    }
  }

  function toggleTarget() {
    if (!targetWrap) return;
    const isAgreement = kind.value === "AGREEMENT";
    targetWrap.style.display = isAgreement ? "block" : "none";
    if (!isAgreement && targetSelect) {
      targetSelect.value = "";
      if (targetHint) targetHint.textContent = "";
    }
  }

  async function loadList() {
    const k = kind.value;
    const id = entityId.value.trim();

    if (!id) {
      listEl.innerHTML = `<div class="h2">Enter Place/Agreement ID to list documents.</div>`;
      return;
    }

    listEl.innerHTML = `<div class="card card-pad">Loading...</div>`;

    try {
      const res = await listDocumentsBy(k, id);
      const docs = res.documents || [];

      if (!docs.length) {
        listEl.innerHTML = `<div class="card card-pad">No documents found for this ${escapeHtml(k)}.</div>`;
        return;
      }

      listEl.innerHTML = `
        <table class="table">
          <thead>
            <tr>
              <th>File</th>
              <th>Kind</th>
              <th>Entity</th>
              <th>Student</th>
              <th>Created</th>
              <th style="width:120px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map((d) => rowDoc(d)).join("")}
          </tbody>
        </table>
      `;

      // ✅ Track + Download
      listEl.querySelectorAll("[data-dl]").forEach((b) => {
        b.addEventListener("click", async () => {
          b.disabled = true;
          const path = b.dataset.dl;

          try {
            // Tracking (no bloquear si falla)
            try { await trackView("DOCUMENT", path, { action: "download_click_admin" }); } catch {}

            const { url } = await getSignedUrl(path);
            window.open(url, "_blank");
          } catch (err) {
            toast({ title: "Error", message: err.message });
          } finally {
            b.disabled = false;
          }
        });
      });
    } catch (err) {
      listEl.innerHTML = `<div class="card card-pad">Failed: ${escapeHtml(err.message)}</div>`;
    }
  }

  function rowDoc(d) {
    const studentName =
      d.targetUserId && usersById.has(d.targetUserId) ? usersById.get(d.targetUserId).name : d.targetUserId || "-";
    const created = d.createdAt ? new Date(d.createdAt).toLocaleString() : "-";

    return `
      <tr>
        <td>${escapeHtml(d.originalName || d.path)}</td>
        <td><span class="badge">${escapeHtml(d.kind)}</span></td>
        <td class="kbd">${escapeHtml(d.entityId)}</td>
        <td>${escapeHtml(studentName)}</td>
        <td>${escapeHtml(created)}</td>
        <td>
          <button class="btn btn-primary" data-dl="${escapeHtml(d.path)}">Download</button>
        </td>
      </tr>
    `;
  }
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
