import crypto from "crypto";

export function normalizeCaption(caption) {
  if (!caption || typeof caption !== "string") return "";
  return caption.trim().replace(/\s+/g, " ").toLowerCase();
}

export function hashCaption(caption) {
  const normalized = normalizeCaption(caption);
  if (!normalized) return null;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}
