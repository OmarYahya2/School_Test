"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const qr_controller_1 = require("../controllers/qr.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public: verify a signed QR token (used by the landing page after scanning)
router.get("/verify", qr_controller_1.QRController.verify);
// Protected: generate a signed QR token (admin or active teacher)
router.post("/generate", auth_middleware_1.authenticate, auth_middleware_1.injectTeacher, auth_middleware_1.requireAdminOrActiveTeacher, qr_controller_1.QRController.generate);
exports.default = router;
//# sourceMappingURL=qr.routes.js.map