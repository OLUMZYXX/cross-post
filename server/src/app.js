import express from "express";
import cors from "cors";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import platformRoutes from "./routes/platform.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.json({ name: "CROSS-POST API" }));

app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/platforms", platformRoutes);

export default app;
