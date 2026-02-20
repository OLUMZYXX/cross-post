import express from "express";
import cors from "cors";
import crypto from "crypto";
import multer from "multer";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { uploadToGridFS, downloadFromGridFS, findFileById } from "./utils/gridfs.js";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "./config/env.js";
import { authenticate } from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static("public"));

// Serve media files from MongoDB GridFS
app.get("/media/:fileId", async (req, res) => {
  try {
    const file = await findFileById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    res.set("Content-Type", file.contentType || "application/octet-stream");
    res.set("Content-Length", file.length);
    res.set("Cache-Control", "public, max-age=86400");

    const stream = downloadFromGridFS(req.params.fileId);
    stream.on("error", () => res.status(404).end());
    stream.pipe(res);
  } catch {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// Upload a single image to GridFS
const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});
app.post("/api/upload/image", uploadSingle.single("image"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }

  const { fileId } = await uploadToGridFS(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
  );

  const url = `${req.protocol}://${req.get("host")}/media/${fileId}`;
  res.json({ success: true, data: { url } });
});

// Upload media to Cloudinary (signed upload via server)
const uploadCloudinary = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
app.post(
  "/api/upload/cloudinary",
  authenticate,
  uploadCloudinary.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(500).json({ success: false, message: "Cloudinary is not configured" });
    }

    const resourceType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "cross-post";

    // Generate signature
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

    const formData = new FormData();
    formData.append("file", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
    formData.append("api_key", CLOUDINARY_API_KEY);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      { method: "POST", body: formData },
    );

    if (!cloudRes.ok) {
      const err = await cloudRes.json().catch(() => ({}));
      return res.status(500).json({
        success: false,
        message: err?.error?.message || "Cloudinary upload failed",
      });
    }

    const data = await cloudRes.json();
    const optimizedUrl = data.secure_url.replace("/upload/", "/upload/f_auto,q_auto/");

    res.json({ success: true, data: { url: optimizedUrl, publicId: data.public_id } });
  },
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.json({ name: "CROSS-POST API" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/platforms", platformRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
