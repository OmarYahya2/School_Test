"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQRToken = generateQRToken;
exports.verifyQRToken = verifyQRToken;
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const QR_SECRET = env_1.env.JWT_SECRET + ":qr-token-v1";
function generateQRToken(gradeId, ttlDays = 365) {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        gradeId,
        iat: now,
        exp: now + ttlDays * 86400,
    };
    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto_1.default
        .createHmac("sha256", QR_SECRET)
        .update(data)
        .digest("base64url");
    return `${data}.${sig}`;
}
function verifyQRToken(token) {
    try {
        const dotIndex = token.lastIndexOf(".");
        if (dotIndex === -1)
            return null;
        const data = token.substring(0, dotIndex);
        const sig = token.substring(dotIndex + 1);
        const expectedSig = crypto_1.default
            .createHmac("sha256", QR_SECRET)
            .update(data)
            .digest("base64url");
        if (sig !== expectedSig)
            return null;
        const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
        if (typeof payload.gradeId !== "number" ||
            payload.gradeId < 1 ||
            payload.gradeId > 9)
            return null;
        if (payload.exp < Math.floor(Date.now() / 1000))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=qr-token.utils.js.map