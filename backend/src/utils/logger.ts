import { AsyncLocalStorage } from "async_hooks";
import { env } from "../config/env";

export interface LogContext {
  requestId: string;
}

export const requestContext = new AsyncLocalStorage<LogContext>();

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.requestId;
}

export function logInfo(message: string, meta: Record<string, any> = {}) {
  const requestId = getRequestId();
  const timestamp = new Date().toISOString();

  if (env.LOG_FORMAT === "json") {
    console.log(
      JSON.stringify({
        timestamp,
        level: "INFO",
        message,
        requestId,
        ...meta,
      })
    );
  } else {
    const idStr = requestId ? ` [${requestId.slice(0, 8)}]` : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    console.log(`\x1b[32m[${timestamp}]${idStr} INFO:\x1b[0m ${message}${metaStr}`);
  }
}

export function logError(message: string, err: any = {}, meta: Record<string, any> = {}) {
  const requestId = getRequestId();
  const timestamp = new Date().toISOString();
  const errDetails = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err;

  if (env.LOG_FORMAT === "json") {
    console.error(
      JSON.stringify({
        timestamp,
        level: "ERROR",
        message,
        requestId,
        error: errDetails,
        ...meta,
      })
    );
  } else {
    const idStr = requestId ? ` [${requestId.slice(0, 8)}]` : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    console.error(`\x1b[31m[${timestamp}]${idStr} ERROR:\x1b[0m ${message}${metaStr}`, errDetails);
  }
}
