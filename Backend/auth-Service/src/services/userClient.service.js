const { USER_SERVICE_URL, INTERNAL_API_KEY } = process.env;

async function verifyCredentials(email, password) {
  const res = await fetch(`${USER_SERVICE_URL}/internal/auth/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": INTERNAL_API_KEY
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

  return data.user;
}

module.exports = { verifyCredentials };

