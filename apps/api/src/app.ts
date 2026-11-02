import express, { Application } from "express";
import cors from "cors";
import path from "path";
import { ENV } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: [ENV.CORS_ORIGIN, "http://localhost:3000"],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  const uploadsPath = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
  app.use("/uploads", express.static(uploadsPath));

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "suaraksi-api",
    });
  });

  app.use("/api", apiRoutes);

  app.use(errorHandler);

  return app;
}
