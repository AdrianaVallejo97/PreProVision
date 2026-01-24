import { http } from "./http.js";

export function uploadDocument({ file, kind, entityId, targetUserId }) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  fd.append("entityId", entityId);
  fd.append("targetUserId", targetUserId);
  return http("/documents/upload", { method: "POST", body: fd });
}

export function listDocumentsBy(kind, entityId) {
  const qs = `kind=${encodeURIComponent(kind)}&entityId=${encodeURIComponent(entityId)}`;
  return http(`/documents?${qs}`, { method: "GET" });
}

export function getSignedUrl(path) {
  return http(`/documents/signed-url?path=${encodeURIComponent(path)}`, { method: "GET" });
}

export function listMyDocuments() {
  return http("/documents/my", { method: "GET" });
}
