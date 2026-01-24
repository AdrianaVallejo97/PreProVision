import { http } from "./http.js";

export function listAgreements() {
  return http("/agreements", { method: "GET" });
}

export function createAgreement(placeId) {
  return http("/agreements", {
    method: "POST",
    body: JSON.stringify({ placeId })
  });
}

export function approveAgreement(id) {
  return http(`/agreements/${id}/approve`, { method: "PATCH" });
}

export function rejectAgreement(id) {
  return http(`/agreements/${id}/reject`, { method: "PATCH" });
}

export function cancelAgreement(id) {
  return http(`/agreements/${id}/cancel`, { method: "PATCH" });
}
export function listApprovedUsersByPlace(placeId) {
  return http(`/agreements/place/${placeId}/approved-users`, { method: "GET" });
}
