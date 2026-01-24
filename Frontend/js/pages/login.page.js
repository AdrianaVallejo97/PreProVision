// login.page.js
// Login page logic
// login.page.js
// Login page logic (NO auto-redirect)

import { login } from "../services/auth.api.js";
import { setSession } from "../store/session.js";
import { toast } from "../ui/components.js";

export function initLoginPage() {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const btn = document.getElementById("btnLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    btn.disabled = true;
    btn.textContent = "Signing in...";

    try {
      const data = await login(email.value.trim(), password.value);

      // Expected response: { token, user: { userId, name, email, roleName } }
      setSession({ token: data.token, user: data.user });

      toast({ title: "Success", message: "Logged in successfully." });

      // Redirect based on role
      const role = data?.user?.roleName;
      if (role === "ADMIN") location.hash = "#/admin/dashboard";
      else location.hash = "#/student/dashboard";

    } catch (err) {
      toast({ title: "Login failed", message: err.message || "Invalid credentials" });
    } finally {
      btn.disabled = false;
      btn.textContent = "Login";
    }
  });
}
