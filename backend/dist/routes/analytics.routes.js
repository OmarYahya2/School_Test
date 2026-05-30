"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected: admin-only analytics summary
router.get("/summary", auth_middleware_1.authenticate, auth_middleware_1.requireAdmin, analytics_controller_1.AnalyticsController.getSummary);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map