import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { sendError } from "../utils/response.utils";
import { logError } from "../utils/logger";

/**
 * Maps Prisma known error codes to user-friendly HTTP responses.
 * Prevents raw Prisma stack traces from leaking as 500s.
 */
function handlePrismaError(err: Prisma.PrismaClientKnownRequestError, res: Response) {
  switch (err.code) {
    case "P2002": {
      // Unique constraint violation — e.g. duplicate email
      const fields = (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return sendError(res, `A record with this ${fields} already exists.`, 409);
    }
    case "P2003": {
      // Foreign key constraint failed — related record missing
      const field = (err.meta?.field_name as string | undefined) ?? "reference";
      return sendError(res, `Related ${field} record does not exist.`, 400);
    }
    case "P2025": {
      // Record not found (e.g. update/delete on missing row)
      const cause = (err.meta?.cause as string | undefined) ?? "Record not found.";
      return sendError(res, cause, 404);
    }
    case "P2014": {
      return sendError(res, "Operation would violate a required relation.", 400);
    }
    default: {
      logError(`Prisma database error: ${err.message}`, err, { code: err.code });
      return sendError(res, "A database error occurred.", 500);
    }
  }
}

export function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  // Handle Prisma validation errors (bad data shape sent to Prisma)
  if (err instanceof Prisma.PrismaClientValidationError) {
    logError(`Prisma validation error: ${err.message}`, err);
    return sendError(res, "Invalid data provided to the database.", 400);
  }

  // Log unexpected errors in full
  if (!err.status || err.status >= 500) {
    logError(`Unhandled request error: ${err.message || err}`, err);
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";
  const errors = err.errors || undefined;

  return sendError(res, message, status, errors);
}
