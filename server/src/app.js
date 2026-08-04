import express from "express";
import cors from "cors";
import crypto from "crypto";
import multer from "multer";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import scorecardRoutes from "./routes/scorecard.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import teamRoutes from "./routes/team.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { uploadToGridFS } from "./utils/gridfs.js";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "./config/env.js";
import { authenticate } from "./middleware/auth.js";
import User from "./models/User.js";
import { applyWatermarkToUrl } from "./services/watermark.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static("public"));

app.get("/tiktoksjU2flTW2wY5Cz8uW8PYxfs5y79JZxlL.txt", (_req, res) =>
  res
    .type("text/plain")
    .send(
      "tiktok-developers-site-verification=sjU2flTW2wY5Cz8uW8PYxfs5y79JZxlL",
    ),
);

app.use("/media", mediaRoutes);

const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});
app.post(
  "/api/upload/image",
  uploadSingle.single("image"),
  async (req, res) => {
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
  },
);

const uploadCloudinary = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
});
app.post(
  "/api/upload/cloudinary",
  authenticate,
  uploadCloudinary.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return res
        .status(500)
        .json({ success: false, message: "Cloudinary is not configured" });
    }

    const resourceType = req.file.mimetype.startsWith("video/")
      ? "video"
      : "image";
    const skipWatermark = req.body.skipWatermark === "true";
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = skipWatermark ? "cross-post/watermarks" : "cross-post";

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign)
      .digest("hex");

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname,
    );
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
    const optimizedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/f_auto,q_auto/",
    );

    let finalUrl = optimizedUrl;
    if (!skipWatermark && req.user?.id) {
      const acting = await User.findById(req.user.id).select("teamOwnerId watermark");
      let watermark = acting?.watermark;
      const wsId = acting?.teamOwnerId ? acting.teamOwnerId.toString() : null;
      if (wsId && wsId !== req.user.id) {
        const owner = await User.findById(wsId).select("watermark");
        watermark = owner?.watermark;
      }
      finalUrl = applyWatermarkToUrl(optimizedUrl, watermark);
      if (resourceType === "video" && finalUrl !== optimizedUrl) {
        fetch(finalUrl, { headers: { Range: "bytes=0-0" } }).catch(() => {});
      }
    }

    res.json({
      success: true,
      data: { url: finalUrl, publicId: data.public_id },
    });
  },
);

app.get("/health", (_req, res) =>
  res.json({ status: "ok", build: "scorecard-band-2" }),
);
app.get("/", (_req, res) => res.sendFile("index.html", { root: "public" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/scorecard", scorecardRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/team", teamRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
