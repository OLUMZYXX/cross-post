import express from "express";
import cors from "cors";
import multer from "multer";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use(express.static("public"));

// Serve media stored in MongoDB
import Media from "./models/Media.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
app.get(
  "/api/media/:id",
  asyncHandler(async (req, res) => {
    const media = await Media.findById(req.params.id).select("data contentType");
    if (!media) return res.status(404).json({ success: false, message: "Not found" });
    res.setHeader("Content-Type", media.contentType || "application/octet-stream");
    res.send(media.data);
  }),
);

// Upload endpoint now stores image in MongoDB and returns a media URL
app.post(
  "/api/upload/image",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Guard: MongoDB document max size is 16MB — reject very large files
    const MAX_DB_FILE = 15 * 1024 * 1024; // 15MB
    if (req.file.size > MAX_DB_FILE) {
      return res.status(400).json({
        success: false,
        message:
          "File too large to store in MongoDB document (max 15MB). Use external storage or reduce file size.",
      });
    }

    const media = new Media({
      filename: req.file.originalname,
      data: req.file.buffer,
      contentType: req.file.mimetype,
      size: req.file.size,
    });

    await media.save();

    const url = `${req.protocol}://${req.get("host")}/api/media/${media._id}`;
    res.json({ success: true, data: { url } });
  }),
);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.json({ name: "CROSS-POST API" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/platforms", platformRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
