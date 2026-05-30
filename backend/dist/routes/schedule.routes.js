"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const schedule_validator_1 = require("../validators/schedule.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const router = (0, express_1.Router)();
const publicLimiter = (0, rate_limit_middleware_1.rateLimit)({ windowMs: 60 * 1000, maxHits: 300, keyPrefix: "schedule-pub" });
router.use(auth_middleware_1.authenticate);
router.use(auth_middleware_1.injectTeacher);
router.get("/", publicLimiter, schedule_controller_1.ScheduleController.getAll);
router.get("/class/:classId", publicLimiter, schedule_controller_1.ScheduleController.getByClass);
router.post("/", auth_middleware_1.requireAdmin, schedule_validator_1.scheduleValidator, validate_middleware_1.validate, schedule_controller_1.ScheduleController.create);
router.put("/:id", auth_middleware_1.requireAdmin, schedule_validator_1.scheduleValidator, validate_middleware_1.validate, schedule_controller_1.ScheduleController.update);
router.delete("/:id", auth_middleware_1.requireAdmin, schedule_controller_1.ScheduleController.delete);
exports.default = router;
//# sourceMappingURL=schedule.routes.js.map