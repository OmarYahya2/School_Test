import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "super-secret-key-change-me-in-production-1234567890",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "super-secret-refresh-key-change-me-in-production-0987654321",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:3001",
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  REDIS_URL: process.env.REDIS_URL || "",
  LOG_FORMAT: process.env.LOG_FORMAT || "color", // 'color' or 'json'
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "local", // 'local' or 's3'
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "us-east-1",
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET || "",
};

// Validate critical env variables
if (!env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

if (env.NODE_ENV === "production") {
  const isDefaultSecret = 
    env.JWT_SECRET === "super-secret-key-change-me-in-production-1234567890" || 
    env.JWT_SECRET === "super-secret-key-change-me-in-production" ||
    env.JWT_SECRET.length < 16;
  if (isDefaultSecret) {
    throw new Error("FATAL: A secure, non-default JWT_SECRET must be configured in production (minimum 16 characters).");
  }

  const isDefaultRefreshSecret = 
    env.JWT_REFRESH_SECRET === "super-secret-refresh-key-change-me-in-production-0987654321" || 
    env.JWT_REFRESH_SECRET.length < 16;
  if (isDefaultRefreshSecret) {
    throw new Error("FATAL: A secure, non-default JWT_REFRESH_SECRET must be configured in production (minimum 16 characters).");
  }
}

