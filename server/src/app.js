import express from "express";
import cors from "cors";
import postRoutes from "./routes/post.routes.js";
import authRoutes from "./routes/auth.routes.js";
import platformRoutes from "./routes/platform.routes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/", (_req, res) => res.json({ name: "CROSS-POST API" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/platforms", platformRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
