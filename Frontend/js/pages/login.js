import { api } from "../api.js";
import { setToken, setUser } from "../storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");
  const email = document.querySelector("#email");
  const password = document.querySelector("#password");
  const msg = document.querySelector("#msg");
  const btn = document.querySelector("#btnLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    msg.textContent = "";
    msg.className = "msg";

    const emailVal = (email.value || "").trim();
    const passVal = password.value || "";

    if (!emailVal || !passVal) {
      msg.textContent = "Please enter email and password.";
      msg.classList.add("error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      const data = await api.login(emailVal, passVal);

      // Expected response: { token, user: { userId, email, roleName, ... } }
      setToken(data.token);
      setUser(data.user);

      const role = data?.user?.roleName;

      // Redirect based on role
      if (role === "ADMIN") window.location.href = "/public/admin/dashboard.html";
      else if (role === "STUDENT") window.location.href = "/public/student/dashboard.html";
      else window.location.href = "/public/unauthorized.html";
    } catch (err) {
      console.error(err);
      msg.textContent = err?.data?.error || err.message || "Login failed.";
      msg.classList.add("error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });
});
