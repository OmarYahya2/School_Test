"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
let redisClient = null;
exports.redisClient = redisClient;
if (env_1.env.REDIS_URL) {
    try {
        exports.redisClient = redisClient = new ioredis_1.default(env_1.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 100, 3000);
                return delay;
            },
        });
        redisClient.on("connect", () => {
            (0, logger_1.logInfo)("Connected to Redis successfully");
        });
        redisClient.on("error", (err) => {
            (0, logger_1.logError)("Redis connection error", err);
        });
    }
    catch (err) {
        (0, logger_1.logError)("Failed to initialize Redis client", err);
    }
}
else {
    (0, logger_1.logInfo)("Redis URL not configured. Services will run in in-memory fallback mode.");
}
//# sourceMappingURL=redis.js.map