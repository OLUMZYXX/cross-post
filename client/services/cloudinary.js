import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiConfig";

const TOKEN_KEY = "@crosspost_token";
const UPLOAD_TIMEOUT = 600000;

export async function uploadToCloudinary(
  uri,
  type = "image",
  mimeType,
  fileName,
  { skipWatermark = false } = {},
) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  const actualMimeType = mimeType || (type === "video" ? "video/mp4" : "image/jpeg");
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
  if (skipWatermark) {
    formData.append("skipWatermark", "true");
  }

  const serverUrl = API_BASE_URL.replace(/\/api$/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

  try {
    const response = await fetch(`${serverUrl}/api/upload/cloudinary`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.message || "Upload failed");
    }

    const result = await response.json();
    return { url: result.data.url, publicId: result.data.publicId };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error("Upload timed out. Try a shorter or lower quality video.");
    }
    throw err;
  }
}
