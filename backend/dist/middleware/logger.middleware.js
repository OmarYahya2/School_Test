"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
/**
 * HTTP request logger middleware.
 * Generates/extracts a unique Request ID, exposes it via headers,
 * and wraps downstream requests in an AsyncLocalStorage context.
 */
function requestLogger(req, res, next) {
    const requestId = req.headers["x-request-id"] || crypto_1.default.randomUUID();
    req.headers["x-request-id"] = requestId;
    res.setHeader("X-Request-ID", requestId);
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    logger_1.requestContext.run({ requestId }, () => {
        res.on("finish", () => {
            const duration = Date.now() - start;
            const status = res.statusCode;
            (0, logger_1.logInfo)(`${method} ${originalUrl} → ${status} (${duration}ms)`, {
                method,
                path: originalUrl,
                statusCode: status,
                latencyMs: duration,
                ip: ip || req.socket.remoteAddress || "unknown",
            });
        });
        next();
    });
}
//# sourceMappingURL=logger.middleware.js.map