import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.utils";
import { redisClient } from "../lib/redis";
import { logError } from "../utils/logger";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Production-ready rate limiter middleware.
 * Uses Redis if available, otherwise falls back to a memory-efficient local store.
 */
export function rateLimit(options: {
  windowMs?: number;
  maxHits?: number;
  keyPrefix?: string;
} = {}) {
  const { windowMs = 15 * 60 * 1000, maxHits = 20, keyPrefix = "global" } = options;

  // Local memory store setup for fallback
  if (!stores.has(keyPrefix)) {
    stores.set(keyPrefix, new Map());
  }
  const store = stores.get(keyPrefix)!;

  // Periodically clean expired local entries
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  
  if (typeof interval.unref === "function") {
    interval.unref();
  }

  const handleMemoryLimit = (ip: string, res: Response, next: NextFunction) => {
    const now = Date.now();
    const existing = store.get(ip);

    if (!existing || now > existing.resetTime) {
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    existing.count++;

    if (existing.count > maxHits) {
      const retryAfterSec = Math.ceil((existing.resetTime - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      return sendError(res, "Too many requests. Please try again later.", 429);
    }

    return next();
  };

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";

    if (redisClient) {
      try {
        const key = `ratelimit:${keyPrefix}:${ip}`;
        const current = await redisClient.incr(key);

        if (current === 1) {
          await redisClient.expire(key, Math.ceil(windowMs / 1000));
        }

        if (current > maxHits) {
          const ttl = await redisClient.ttl(key);
          res.set("Retry-After", String(ttl > 0 ? ttl : 1));
          return sendError(res, "Too many requests. Please try again later.", 429);
        }

        return next();
      } catch (err) {
        logError("Redis rate limiter failed. Falling back to memory store.", err);
        return handleMemoryLimit(ip, res, next);
      }
    }

    return handleMemoryLimit(ip, res, next);
  };
}
