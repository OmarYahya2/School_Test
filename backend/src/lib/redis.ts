import Redis from "ioredis";
import { env } from "../config/env";
import { logInfo, logError } from "../utils/logger";

let redisClient: Redis | null = null;

if (env.REDIS_URL) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    });

    redisClient.on("connect", () => {
      logInfo("Connected to Redis successfully");
    });

    redisClient.on("error", (err) => {
      logError("Redis connection error", err);
    });
  } catch (err) {
    logError("Failed to initialize Redis client", err);
  }
} else {
  logInfo("Redis URL not configured. Services will run in in-memory fallback mode.");
}

export { redisClient };
