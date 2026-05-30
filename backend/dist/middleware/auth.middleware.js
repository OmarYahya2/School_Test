"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
exports.requireAdmin = requireAdmin;
exports.requireTeacher = requireTeacher;
exports.injectTeacher = injectTeacher;
exports.requireAdminOrActiveTeacher = requireAdminOrActiveTeacher;
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = require("../lib/prisma");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return (0, response_utils_1.sendError)(res, "Access denied. No token provided.", 401);
    }
    const token = authHeader.split(" ")[1];
    const decoded = (0, jwt_utils_1.verifyToken)(token);
    if (!decoded) {
        return (0, response_utils_1.sendError)(res, "Invalid or expired token.", 401);
    }
    req.user = decoded;
    next();
}
function authorize(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_utils_1.sendError)(res, "Authentication required.", 401);
        }
        if (!roles.includes(req.user.role)) {
            return (0, response_utils_1.sendError)(res, "Access denied. Insufficient permissions.", 403);
        }
        next();
    };
}
/** Alias for admin-only routes */
function requireAdmin(req, res, next) {
    if (!req.user) {
        return (0, response_utils_1.sendError)(res, "Authentication required.", 401);
    }
    if (req.user.role !== "admin") {
        return (0, response_utils_1.sendError)(res, "Access denied. Admin only.", 403);
    }
    next();
}
/** Alias for teacher-only routes */
function requireTeacher(req, res, next) {
    if (!req.user) {
        return (0, response_utils_1.sendError)(res, "Authentication required.", 401);
    }
    if (req.user.role !== "teacher") {
        return (0, response_utils_1.sendError)(res, "Access denied. Teacher only.", 403);
    }
    next();
}
/** Injects teacher profile into req.teacher for teacher users. Must run after authenticate. */
async function injectTeacher(req, res, next) {
    try {
        if (!req.user) {
            return (0, response_utils_1.sendError)(res, "Authentication required.", 401);
        }
        if (req.user.role === "teacher" && req.user.teacherId) {
            const teacher = await prisma_1.prisma.teacher.findUnique({
                where: { id: req.user.teacherId },
                select: { id: true, name: true, email: true, isActive: true, assignedSubjects: true },
            });
            if (!teacher) {
                return (0, response_utils_1.sendError)(res, "Teacher profile not found.", 403);
            }
            if (!teacher.isActive) {
                return (0, response_utils_1.sendError)(res, "Account deactivated. Contact your administrator.", 403);
            }
            req.teacher = teacher;
        }
        next();
    }
    catch (error) {
        next(error);
    }
}
/** Ensures the user is either an admin OR an active teacher with a linked profile */
function requireAdminOrActiveTeacher(req, res, next) {
    if (!req.user) {
        return (0, response_utils_1.sendError)(res, "Authentication required.", 401);
    }
    if (req.user.role === "admin") {
        return next();
    }
    if (req.user.role === "teacher") {
        if (!req.teacher) {
            return (0, response_utils_1.sendError)(res, "Teacher profile not found.", 403);
        }
        if (!req.teacher.isActive) {
            return (0, response_utils_1.sendError)(res, "Account deactivated. Contact your administrator.", 403);
        }
        return next();
    }
    return (0, response_utils_1.sendError)(res, "Access denied. Insufficient permissions.", 403);
}
//# sourceMappingURL=auth.middleware.js.map