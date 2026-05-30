"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRController = void 0;
const qr_token_utils_1 = require("../utils/qr-token.utils");
const response_utils_1 = require("../utils/response.utils");
const VALID_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
class QRController {
    static async generate(req, res, next) {
        try {
            const gradeId = parseInt(req.body.gradeId, 10);
            if (isNaN(gradeId) || !VALID_GRADES.includes(gradeId)) {
                return (0, response_utils_1.sendError)(res, "Invalid gradeId. Must be an integer between 1 and 9.", 400);
            }
            const token = (0, qr_token_utils_1.generateQRToken)(gradeId);
            return (0, response_utils_1.sendSuccess)(res, { token, gradeId }, "QR token generated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async verify(req, res, next) {
        try {
            const { token } = req.query;
            if (!token || typeof token !== "string" || token.trim() === "") {
                return (0, response_utils_1.sendError)(res, "Token query parameter is required.", 400);
            }
            const payload = (0, qr_token_utils_1.verifyQRToken)(token.trim());
            if (!payload) {
                return (0, response_utils_1.sendError)(res, "Invalid or expired QR token.", 401);
            }
            return (0, response_utils_1.sendSuccess)(res, { gradeId: payload.gradeId }, "Token verified successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.QRController = QRController;
//# sourceMappingURL=qr.controller.js.map