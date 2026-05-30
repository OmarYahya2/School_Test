"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_validator_1 = require("../validators/auth.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
// Strict rate limit for authentication endpoints (e.g. 10 attempts per 10 minutes)
const authLimiter = (0, rate_limit_middleware_1.rateLimit)({
    windowMs: 10 * 60 * 1000,
    maxHits: 10,
    keyPrefix: "auth",
});
router.post("/register", authLimiter, auth_validator_1.registerValidator, validate_middleware_1.validate, auth_controller_1.AuthController.register);
router.post("/login", authLimiter, auth_validator_1.loginValidator, validate_middleware_1.validate, auth_controller_1.AuthController.login);
router.post("/refresh", authLimiter, auth_controller_1.AuthController.refresh);
router.post("/logout", auth_controller_1.AuthController.logout);
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.AuthController.me);
router.put("/me", auth_middleware_1.authenticate, auth_controller_1.AuthController.updateMe);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map