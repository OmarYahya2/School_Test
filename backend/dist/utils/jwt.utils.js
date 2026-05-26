"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
}
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, {
        expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN,
    });
}
function verifyRefreshToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=jwt.utils.js.map