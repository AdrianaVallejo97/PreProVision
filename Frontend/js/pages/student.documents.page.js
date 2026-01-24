import { listMyDocuments, getSignedUrl } from "../services/documents.api.js";
import { toast } from "../ui/components.js";
import { trackView } from "../services/viewing.api.js";

export function initStudentDocumentsPage() {
  const wrap = document.getElementById("myDocsWrap");
  const btn = document.getElementById("btnReloadMyDocs");

  if (btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  btn.addEventListener("click", () => load());
  load();

  async function load() {
    wrap.innerHTML = `<div class="card card-pad">Loading...</div>`;

    try {
      const res = await listMyDocuments();
      const docs = res.documents || [];

      // ✅ Track page view
      try { await trackView("DOCUMENT", "my", { action: "page_view" }); } catch {}

      if (!docs.length) {
        wrap.innerHTML = `<div class="card card-pad">${escapeHtml(res.message || "No documents available.")}</div>`;
        return;
      }

      wrap.innerHTML = docs.map(d => `
        <div class="card card-pad" style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <p class="h1" style="margin:0;">${escapeHtml(d.originalName || "Document")}</p>
              <p class="h2" style="margin:6px 0 0 0;">${escapeHtml(d.kind)} • ${escapeHtml(d.entityId)}</p>
            </div>
            <button class="btn btn-primary" data-dl="${escapeHtml(d.path)}">Download</button>
          </div>
        </div>
      `).join("");

      wrap.querySelectorAll("[data-dl]").forEach(b => {
        b.addEventListener("click", async () => {
          b.disabled = true;
          const path = b.dataset.dl;

          // ✅ Track download click
          try { await trackView("DOCUMENT", path, { action: "download_click" }); } catch {}

          try {
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
      wrap.innerHTML = `<div class="card card-pad">Failed: ${escapeHtml(err.message)}</div>`;
    }
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
