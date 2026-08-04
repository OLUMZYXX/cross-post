import express from "express";
import { downloadFromGridFS, findFileById } from "../utils/gridfs.js";
import { streamProxiedImage } from "../services/publishers/tiktok.photo.js";

const router = express.Router();

router.get("/tiktok-image", async (req, res) => {
  try {
    await streamProxiedImage(req.query.src, res);
  } catch {
    res.status(502).type("text/plain").send("Could not fetch image");
  }
});

router.get("/:fileId", async (req, res) => {
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

export default router;
