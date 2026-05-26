"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function hashPassword(password) {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
}
async function comparePasswords(password, hashed) {
    return bcryptjs_1.default.compare(password, hashed);
}
//# sourceMappingURL=password.utils.js.map