"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const response_utils_1 = require("../utils/response.utils");
const redis_1 = require("../lib/redis");
const logger_1 = require("../utils/logger");
const stores = new Map();
/**
 * Production-ready rate limiter middleware.
 * Uses Redis if available, otherwise falls back to a memory-efficient local store.
 */
function rateLimit(options = {}) {
    const { windowMs = 15 * 60 * 1000, maxHits = 20, keyPrefix = "global" } = options;
    // Local memory store setup for fallback
    if (!stores.has(keyPrefix)) {
        stores.set(keyPrefix, new Map());
    }
    const store = stores.get(keyPrefix);
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
    const handleMemoryLimit = (ip, res, next) => {
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
            return (0, response_utils_1.sendError)(res, "Too many requests. Please try again later.", 429);
        }
        return next();
    };
    return async (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        if (redis_1.redisClient) {
            try {
                const key = `ratelimit:${keyPrefix}:${ip}`;
                const current = await redis_1.redisClient.incr(key);
                if (current === 1) {
                    await redis_1.redisClient.expire(key, Math.ceil(windowMs / 1000));
                }
                if (current > maxHits) {
                    const ttl = await redis_1.redisClient.ttl(key);
                    res.set("Retry-After", String(ttl > 0 ? ttl : 1));
                    return (0, response_utils_1.sendError)(res, "Too many requests. Please try again later.", 429);
                }
                return next();
            }
            catch (err) {
                (0, logger_1.logError)("Redis rate limiter failed. Falling back to memory store.", err);
                return handleMemoryLimit(ip, res, next);
            }
        }
        return handleMemoryLimit(ip, res, next);
    };
}
//# sourceMappingURL=rate-limit.middleware.js.map