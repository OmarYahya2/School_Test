"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jwt_utils_1 = require("../utils/jwt.utils");
const response_utils_1 = require("../utils/response.utils");
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
//# sourceMappingURL=auth.middleware.js.map