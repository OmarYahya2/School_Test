"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_utils_1 = require("../utils/response.utils");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            return (0, response_utils_1.sendSuccess)(res, result, "User registered successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.login(req.body);
            return (0, response_utils_1.sendSuccess)(res, result, "Logged in successfully", 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async me(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const user = await auth_service_1.AuthService.getUserById(req.user.id);
            return (0, response_utils_1.sendSuccess)(res, user, "User profile retrieved successfully", 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMe(req, res, next) {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const updated = await auth_service_1.AuthService.updateProfile(req.user.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, updated, "Profile updated successfully", 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const result = await auth_service_1.AuthService.refresh(refreshToken);
            return (0, response_utils_1.sendSuccess)(res, result, "Token refreshed successfully", 200);
        }
        catch (error) {
            next(error);
        }
    }
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await auth_service_1.AuthService.logout(refreshToken);
            return (0, response_utils_1.sendSuccess)(res, null, "Logged out successfully", 200);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map