"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContext = void 0;
exports.getRequestId = getRequestId;
exports.logInfo = logInfo;
exports.logError = logError;
const async_hooks_1 = require("async_hooks");
const env_1 = require("../config/env");
exports.requestContext = new async_hooks_1.AsyncLocalStorage();
function getRequestId() {
    return exports.requestContext.getStore()?.requestId;
}
function logInfo(message, meta = {}) {
    const requestId = getRequestId();
    const timestamp = new Date().toISOString();
    if (env_1.env.LOG_FORMAT === "json") {
        console.log(JSON.stringify({
            timestamp,
            level: "INFO",
            message,
            requestId,
            ...meta,
        }));
    }
    else {
        const idStr = requestId ? ` [${requestId.slice(0, 8)}]` : "";
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        console.log(`\x1b[32m[${timestamp}]${idStr} INFO:\x1b[0m ${message}${metaStr}`);
    }
}
function logError(message, err = {}, meta = {}) {
    const requestId = getRequestId();
    const timestamp = new Date().toISOString();
    const errDetails = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;
    if (env_1.env.LOG_FORMAT === "json") {
        console.error(JSON.stringify({
            timestamp,
            level: "ERROR",
            message,
            requestId,
            error: errDetails,
            ...meta,
        }));
    }
    else {
        const idStr = requestId ? ` [${requestId.slice(0, 8)}]` : "";
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
        console.error(`\x1b[31m[${timestamp}]${idStr} ERROR:\x1b[0m ${message}${metaStr}`, errDetails);
    }
}
//# sourceMappingURL=logger.js.map