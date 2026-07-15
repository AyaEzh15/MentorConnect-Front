/** Origine du backend (hors préfixe /api). */
export const API_ORIGIN = "http://172.17.163.67:8082";

/** Origine WebSocket (même hôte que l'API). */
export const WS_URL = `ws://172.17.163.67:8082/ws`;

/**
 * Résout une photo stockée en chemin relatif (/uploads/...) ou URL absolue.
 */
export function resolveMediaUrl(path) {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${API_ORIGIN}${trimmed}`;
  }
  return trimmed;
}
