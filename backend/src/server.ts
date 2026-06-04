import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";
import { env } from "./config/env";
import { globalErrorHandler } from "./middleware/error.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import { prisma } from "./lib/prisma";

const app = express();

// Configure CORS — uses CORS_ORIGIN env var (defaults to * in dev)
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger
app.use(requestLogger);

// Serve static file uploads
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Mount API routes
app.use("/api", routes);

// Fallback health endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`[Server] Running at ${env.BACKEND_URL}`);
  console.log(`[Server] Environment: ${env.NODE_ENV}`);
  console.log(`[Server] CORS origin: ${env.CORS_ORIGIN}`);
  
  // Database pre-heating / connection warmup
  console.log("[Server] Pre-heating database connection pool...");
  prisma.$queryRaw`SELECT 1`
    .then(() => {
      console.log("[Server] Database connection pool pre-heated successfully!");
    })
    .catch((err) => {
      console.error("[Server] Database pre-heating failed:", err);
    });
});

