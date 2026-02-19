import express from "express";
import cors from "cors";
import multer from "multer";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { uploadToGridFS, downloadFromGridFS, findFileById } from "./utils/gridfs.js";

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

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.json({ name: "CROSS-POST API" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/platforms", platformRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
