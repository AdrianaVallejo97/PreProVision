async function verifyCredentials(email, password) {
  const baseUrl = process.env.USER_SERVICE_URL;
  const internalKey = process.env.INTERNAL_API_KEY;

  const res = await fetch(`${baseUrl}/internal/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": internalKey
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error || "User-service error";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data.user; // { userId, name, email, roleName, status... }
}

module.exports = { verifyCredentials };
