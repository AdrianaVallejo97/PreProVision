import { getReports } from "../services/reports.api.js";
import { toast } from "../ui/components.js";

export function initAdminReportsPage() {
  const cards = document.getElementById("reportCards");
  const btn = document.getElementById("btnReloadReports");
  const canvas = document.getElementById("agreementsChart");
  const ctx = canvas.getContext("2d");

  btn.addEventListener("click", () => load());
  load();

  async function load() {
    cards.innerHTML = `<div class="card card-pad">Loading reports...</div>`;
    try {
      const r = await getReports();

      const usersLabel = r.usersTotal === null ? "Users (needs /users)" : "Users";
      const usersValue = r.usersTotal === null ? "—" : String(r.usersTotal);

      cards.innerHTML = `
        <div class="card card-pad card-metric">
          <p class="label">${usersLabel}</p>
          <p class="value">${usersValue}</p>
        </div>
        <div class="card card-pad card-metric">
          <p class="label">Places</p>
          <p class="value">${r.placesTotal}</p>
        </div>
        <div class="card card-pad card-metric">
          <p class="label">Places OPEN</p>
          <p class="value">${r.placesOpen}</p>
        </div>
        <div class="card card-pad card-metric">
          <p class="label">Agreements</p>
          <p class="value">${r.agreementsTotal}</p>
        </div>
      `;

      drawBarChart(ctx, canvas, r.agreementsByStatus);

    } catch (err) {
      toast({ title: "Error", message: err.message });
      cards.innerHTML = `<div class="card card-pad">Failed: ${escapeHtml(err.message)}</div>`;
    }
  }
}

// Simple canvas bar chart (no libs)
function drawBarChart(ctx, canvas, data) {
  const labels = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  const values = labels.map(l => Number(data[l] || 0));
  const max = Math.max(1, ...values);

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pad = 40;
  const w = canvas.width - pad * 2;
  const h = canvas.height - pad * 2;
  const barW = w / labels.length;

  // Axes
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px system-ui";

  // Bars
  values.forEach((v, i) => {
    const x = pad + i * barW + 10;
    const bh = (v / max) * (h - 20);
    const y = pad + (h - bh);

    // bar
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x, y, barW - 20, bh);

    // value
    ctx.globalAlpha = 0.95;
    ctx.fillText(String(v), x + 6, y - 8);

    // label
    ctx.globalAlpha = 0.85;
    ctx.fillText(labels[i], x, pad + h + 18);
  });

  ctx.globalAlpha = 1;
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
