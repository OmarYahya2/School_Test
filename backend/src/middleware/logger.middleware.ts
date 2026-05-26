import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { requestContext, logInfo } from "../utils/logger";

/**
 * HTTP request logger middleware.
 * Generates/extracts a unique Request ID, exposes it via headers, 
 * and wraps downstream requests in an AsyncLocalStorage context.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers["x-request-id"] as string) || crypto.randomUUID();
  
  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);

  const start = Date.now();
  const { method, originalUrl, ip } = req;

  requestContext.run({ requestId }, () => {
    res.on("finish", () => {
      const duration = Date.now() - start;
      const status = res.statusCode;

      logInfo(`${method} ${originalUrl} → ${status} (${duration}ms)`, {
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
