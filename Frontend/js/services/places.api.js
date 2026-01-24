import { http } from "./http.js";

export function listPlaces() {
  return http("/places");
}

export function createPlace(data) {
  return http("/places", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export function updatePlace(id, data) {
  return http(`/places/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export function closePlace(id) {
  return http(`/places/${id}/close`, { method: "PATCH" });
}
export function deletePlace(id) {
  return http(`/places/${id}`, { method: "DELETE" });
}