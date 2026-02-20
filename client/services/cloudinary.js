import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiConfig";

const TOKEN_KEY = "@crosspost_token";

/**
 * Upload a file to Cloudinary via the server (signed upload).
 * @param {string} uri - Local file URI
 * @param {"image"|"video"} type - Media type
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(uri, type = "image", mimeType, fileName) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  // Use the actual mimeType from the asset (important for Android where images can be PNG, WebP, etc.)
  const actualMimeType = mimeType || (type === "video" ? "video/mp4" : "image/jpeg");
  // Derive extension from fileName or mimeType
  const ext = fileName
    ? fileName.split(".").pop()
    : actualMimeType.split("/")[1] || (type === "video" ? "mp4" : "jpg");
  const actualName = fileName || `upload_${Date.now()}.${ext}`;

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: actualName,
    type: actualMimeType,
  });

  // Upload through server endpoint (server handles Cloudinary signing)
  const serverUrl = API_BASE_URL.replace(/\/api$/, "");
  const response = await fetch(`${serverUrl}/api/upload/cloudinary`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || "Upload failed");
  }

  const result = await response.json();
  return { url: result.data.url, publicId: result.data.publicId };
}
