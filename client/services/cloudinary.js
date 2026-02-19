import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../config/cloudinaryConfig";

/**
 * Upload a file to Cloudinary and return the optimized URL.
 * @param {string} uri - Local file URI
 * @param {"image"|"video"} type - Media type
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(uri, type = "image") {
  const resourceType = type === "video" ? "video" : "image";

  const formData = new FormData();
  const ext = type === "video" ? "mp4" : "jpg";
  formData.append("file", {
    uri,
    name: `upload_${Date.now()}.${ext}`,
    type: type === "video" ? "video/mp4" : "image/jpeg",
  });
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();

  // Return the auto-optimized URL (f_auto, q_auto)
  const optimizedUrl = data.secure_url.replace(
    "/upload/",
    "/upload/f_auto,q_auto/",
  );

  return { url: optimizedUrl, publicId: data.public_id };
}
