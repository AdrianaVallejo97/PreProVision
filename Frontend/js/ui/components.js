// components.js
// UI helpers: loader + toast notifications
let toastWrap;

export function ensureToastWrap() {
  if (toastWrap) return toastWrap;
  toastWrap = document.createElement("div");
  toastWrap.className = "toast-wrap";
  document.body.appendChild(toastWrap);
  return toastWrap;
}

export function toast({ title = "Notice", message = "", ms = 2800 } = {}) {
  ensureToastWrap();
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <p class="toast-title">${escapeHtml(title)}</p>
    <p class="toast-msg">${escapeHtml(message)}</p>
  `;
  toastWrap.appendChild(el);

  setTimeout(() => el.remove(), ms);
}

export function loaderHTML(label = "Loading...") {
  return `
    <div class="card card-pad">
      <p class="h1">${escapeHtml(label)}</p>
      <p class="h2">Please wait.</p>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
