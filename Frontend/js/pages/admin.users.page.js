import { listUsers, createUser, updateUser, deleteUser } from "../services/users.api.js";
import { toast } from "../ui/components.js";

export function initAdminUsersPage() {
  const wrap = document.getElementById("usersTableWrap");
  const btnReload = document.getElementById("btnReloadUsers");
  const search = document.getElementById("userSearch");

  const formWrap = document.getElementById("userFormWrap");
  const btnToggleForm = document.getElementById("btnToggleUserForm");
  const btnCancelForm = document.getElementById("btnCancelUserForm");

  const form = document.getElementById("userForm");
  const userId = document.getElementById("userId");
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const roleName = document.getElementById("roleName");
  const status = document.getElementById("status");

  const btnReset = document.getElementById("btnResetUser");
  const hint = document.getElementById("editHint");

  // ✅ Anti doble bind (MUY IMPORTANTE)
  if (btnReload.dataset.bound === "1") return;
  btnReload.dataset.bound = "1";

  let all = [];

  // Toggle form
  btnToggleForm.addEventListener("click", () => {
    const willOpen = formWrap.classList.contains("hidden");
    formWrap.classList.toggle("hidden");
    btnToggleForm.textContent = willOpen ? "Hide form" : "Create user";
    if (!willOpen) resetForm();
    if (willOpen) window.scrollTo({ top: 0, behavior: "smooth" });
  });

  btnCancelForm.addEventListener("click", () => {
    formWrap.classList.add("hidden");
    btnToggleForm.textContent = "Create user";
    resetForm();
  });

  btnReload.addEventListener("click", () => load());
  search.addEventListener("input", () => renderTable());
  btnReset.addEventListener("click", () => resetForm());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: name.value.trim(),
      email: email.value.trim(),
      roleName: roleName.value,
      status: status.value
    };

    const isEdit = !!userId.value;

    if (!payload.name || !payload.email) {
      toast({ title: "Validation", message: "Name and Email are required." });
      return;
    }

    try {
      if (isEdit) {
        if (password.value) payload.password = password.value;
        await updateUser(userId.value, payload);
        toast({ title: "Updated", message: "User updated." });
      } else {
        if (!password.value || password.value.length < 6) {
          toast({ title: "Validation", message: "Password is required (min 6) to create user." });
          return;
        }
        payload.password = password.value;
        await createUser(payload);
        toast({ title: "Created", message: "User created." });
      }

      resetForm();
      await load();
    } catch (err) {
      toast({ title: "Error", message: err.message });
    }
  });

  load();

  async function load() {
    wrap.innerHTML = `<div class="card card-pad">Loading users...</div>`;
    try {
      const data = await listUsers();
      all = data.users || [];
      renderTable();
    } catch (err) {
      wrap.innerHTML = `<div class="card card-pad">Failed: ${escapeHtml(err.message)}</div>`;
    }
  }

  function renderTable() {
    const q = (search.value || "").trim().toLowerCase();
    const items = !q ? all : all.filter(u =>
      String(u.email || "").toLowerCase().includes(q) ||
      String(u.name || "").toLowerCase().includes(q) ||
      String(u.userId || "").toLowerCase().includes(q)
    );

    if (!items.length) {
      wrap.innerHTML = `<div class="card card-pad">No users found.</div>`;
      return;
    }

    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>UserId</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th style="width:220px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(u => row(u)).join("")}
        </tbody>
      </table>
    `;

    // Edit
    wrap.querySelectorAll("[data-edit-user]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.editUser;
        const u = all.find(x => x.userId === id || x._id === id) || null;
        if (!u) return;

        userId.value = u.userId || u._id || "";
        name.value = u.name || "";
        email.value = u.email || "";
        roleName.value = u.roleName || "STUDENT";
        status.value = u.status || "ACTIVE";
        password.value = "";

        hint.textContent = `Editing: ${u.email || u.userId}`;

        // ✅ abrir form al editar
        formWrap.classList.remove("hidden");
        btnToggleForm.textContent = "Hide form";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    // Delete
    wrap.querySelectorAll("[data-del-user]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.delUser;
        if (!confirm("Delete this user?")) return;

        btn.disabled = true;
        try {
          await deleteUser(id);
          toast({ title: "Deleted", message: "User deleted." });
          await load();
        } catch (err) {
          toast({ title: "Error", message: err.message });
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  function resetForm() {
    userId.value = "";
    name.value = "";
    email.value = "";
    password.value = "";
    roleName.value = "STUDENT";
    status.value = "ACTIVE";
    hint.textContent = "Create a new user or click “Edit” in the table.";
  }
}

function row(u) {
  const id = escapeHtml(u.userId || u._id || "");
  const st = escapeHtml(u.status || "ACTIVE");
  const role = escapeHtml(u.roleName || "STUDENT");

  return `
    <tr>
      <td class="kbd">${escapeHtml(u.userId || u._id || "")}</td>
      <td>${escapeHtml(u.name || "")}</td>
      <td>${escapeHtml(u.email || "")}</td>
      <td><span class="badge">${role}</span></td>
      <td><span class="badge ${st === "ACTIVE" ? "success" : "warn"}">${st}</span></td>
      <td>
        <button class="btn" data-edit-user="${id}">Edit</button>
        <button class="btn btn-danger" data-del-user="${id}">Delete</button>
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
