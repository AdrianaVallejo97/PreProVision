import { requireAuth } from "../guard.js";
import { clearSession, getUser } from "../storage.js";

requireAuth({ role: "STUDENT" });

document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  console.log("STUDENT USER:", user);

  document.querySelector("#logout").addEventListener("click", () => {
    clearSession();
    window.location.href = "/public/index.html";
  });
});
