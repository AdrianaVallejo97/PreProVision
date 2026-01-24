import { listPlaces } from "./places.api.js";
import { listAgreements } from "./agreements.api.js";
import { listUsers } from "./users.api.js";
import { http } from "./http.js";
/**
 * Reportes en frontend (simple):
 * - usa endpoints existentes /places y /agreements
 * - /users solo si backend ya lo tiene
 */
export function getTopPlaceViews(days = 7) {
  return http(`/viewing/summary?entityType=PLACE&days=${days}`, { method: "GET" });
}
export async function getReports() {
  const [placesRes, agreementsRes] = await Promise.all([
    listPlaces(),
    listAgreements(),
  ]);

  const places = placesRes.places || [];
  const agreements = agreementsRes.agreements || [];

  // Users: si backend aún no tiene /users, no revienta
  let users = [];
  try {
    const usersRes = await listUsers();
    users = usersRes.users || [];
  } catch {
    users = [];
  }

  const counts = agreements.reduce((acc, a) => {
    const s = a.status || "PENDING";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return {
    usersTotal: users.length || null,
    placesTotal: places.length,
    placesOpen: places.filter(p => (p.status || "OPEN") === "OPEN").length,
    agreementsTotal: agreements.length,
    agreementsByStatus: {
      PENDING: counts.PENDING || 0,
      APPROVED: counts.APPROVED || 0,
      REJECTED: counts.REJECTED || 0,
      CANCELLED: counts.CANCELLED || 0,
    }
  };
}
