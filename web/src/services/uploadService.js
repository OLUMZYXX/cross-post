import { API_BASE_URL } from "@/config/api";
import { getToken } from "./api";

export async function uploadToCloudinary(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL.replace(/\/api$/, "")}/api/upload/cloudinary`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.message || "Upload failed");
  }

  const data = await response.json();
  return data.data;
}
