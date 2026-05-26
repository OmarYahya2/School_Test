"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../lib/prisma");
const password_utils_1 = require("../utils/password.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
const env_1 = require("../config/env");
function parseExpiry(expiresInStr) {
    const match = expiresInStr.match(/^(\d+)([dhm])$/);
    const now = new Date();
    if (!match) {
        // Default to 7 days
        now.setDate(now.getDate() + 7);
        return now;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    if (unit === "d") {
        now.setDate(now.getDate() + value);
    }
    else if (unit === "h") {
        now.setHours(now.getHours() + value);
    }
    else if (unit === "m") {
        now.setMinutes(now.getMinutes() + value);
    }
    return now;
}
class AuthService {
    static async register(data) {
        const { name, email, password, role } = data;
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw { status: 400, message: "Email is already registered" };
        }
        const hashedPassword = await (0, password_utils_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "teacher",
            },
        });
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const token = (0, jwt_utils_1.generateToken)(tokenPayload);
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)(tokenPayload);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: parseExpiry(env_1.env.JWT_REFRESH_EXPIRES_IN),
            },
        });
        return {
            token,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async login(data) {
        const { email, password } = data;
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw { status: 400, message: "Invalid email or password" };
        }
        const isMatch = await (0, password_utils_1.comparePasswords)(password, user.password);
        if (!isMatch) {
            throw { status: 400, message: "Invalid email or password" };
        }
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const token = (0, jwt_utils_1.generateToken)(tokenPayload);
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)(tokenPayload);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: parseExpiry(env_1.env.JWT_REFRESH_EXPIRES_IN),
            },
        });
        return {
            token,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async refresh(refreshTokenStr) {
        if (!refreshTokenStr) {
            throw { status: 400, message: "Refresh token is required" };
        }
        const decoded = (0, jwt_utils_1.verifyRefreshToken)(refreshTokenStr);
        if (!decoded) {
            throw { status: 401, message: "Invalid or expired refresh token" };
        }
        const storedToken = await prisma_1.prisma.refreshToken.findUnique({
            where: { token: refreshTokenStr },
        });
        if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
            throw { status: 401, message: "Refresh token is expired or revoked" };
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: storedToken.userId },
        });
        if (!user) {
            throw { status: 401, message: "User not found" };
        }
        // Revoke the used token (Token Rotation pattern)
        await prisma_1.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };
        const newToken = (0, jwt_utils_1.generateToken)(tokenPayload);
        const newRefreshToken = (0, jwt_utils_1.generateRefreshToken)(tokenPayload);
        await prisma_1.prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                expiresAt: parseExpiry(env_1.env.JWT_REFRESH_EXPIRES_IN),
            },
        });
        return {
            token: newToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    static async logout(refreshTokenStr) {
        if (!refreshTokenStr) {
            return;
        }
        // Mark the refresh token as revoked
        await prisma_1.prisma.refreshToken.updateMany({
            where: { token: refreshTokenStr },
            data: { revokedAt: new Date() },
        });
    }
    static async getUserById(id) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw { status: 404, message: "User not found" };
        }
        return user;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map