import { requireAuth } from "../guard.js";
import { clearSession, getUser } from "../storage.js";

requireAuth({ role: "ADMIN" });

document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  console.log("ADMIN USER:", user);

  document.querySelector("#logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "/public/index.html";
  });
});
