async function hasApprovedAgreement({ gatewayUrl, token }) {
  const res = await fetch(`${gatewayUrl}/agreements`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return false;

  const agreements = data.agreements || [];
  return agreements.some(a => a.status === "APPROVED");
}

async function getApprovedPlaceIds({ gatewayUrl, token }) {
  const res = await fetch(`${gatewayUrl}/agreements`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return [];

  const agreements = data.agreements || [];
  return agreements
    .filter(a => a.status === "APPROVED")
    .map(a => String(a.placeId));
}

module.exports = { hasApprovedAgreement, getApprovedPlaceIds };
