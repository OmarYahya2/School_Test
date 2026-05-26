"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = globalErrorHandler;
const client_1 = require("@prisma/client");
const response_utils_1 = require("../utils/response.utils");
const logger_1 = require("../utils/logger");
/**
 * Maps Prisma known error codes to user-friendly HTTP responses.
 * Prevents raw Prisma stack traces from leaking as 500s.
 */
function handlePrismaError(err, res) {
    switch (err.code) {
        case "P2002": {
            // Unique constraint violation — e.g. duplicate email
            const fields = err.meta?.target?.join(", ") ?? "field";
            return (0, response_utils_1.sendError)(res, `A record with this ${fields} already exists.`, 409);
        }
        case "P2003": {
            // Foreign key constraint failed — related record missing
            const field = err.meta?.field_name ?? "reference";
            return (0, response_utils_1.sendError)(res, `Related ${field} record does not exist.`, 400);
        }
        case "P2025": {
            // Record not found (e.g. update/delete on missing row)
            const cause = err.meta?.cause ?? "Record not found.";
            return (0, response_utils_1.sendError)(res, cause, 404);
        }
        case "P2014": {
            return (0, response_utils_1.sendError)(res, "Operation would violate a required relation.", 400);
        }
        default: {
            (0, logger_1.logError)(`Prisma database error: ${err.message}`, err, { code: err.code });
            return (0, response_utils_1.sendError)(res, "A database error occurred.", 500);
        }
    }
}
function globalErrorHandler(err, req, res, next) {
    // Handle Prisma known errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        return handlePrismaError(err, res);
    }
    // Handle Prisma validation errors (bad data shape sent to Prisma)
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        (0, logger_1.logError)(`Prisma validation error: ${err.message}`, err);
        return (0, response_utils_1.sendError)(res, "Invalid data provided to the database.", 400);
    }
    // Log unexpected errors in full
    if (!err.status || err.status >= 500) {
        (0, logger_1.logError)(`Unhandled request error: ${err.message || err}`, err);
    }
    const status = err.status || err.statusCode || 500;
    const message = err.message || "An unexpected error occurred.";
    const errors = err.errors || undefined;
    return (0, response_utils_1.sendError)(res, message, status, errors);
}
//# sourceMappingURL=error.middleware.js.map