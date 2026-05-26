"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const schedule_validator_1 = require("../validators/schedule.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public reads
router.get("/", schedule_controller_1.ScheduleController.getAll);
router.get("/class/:classId", schedule_controller_1.ScheduleController.getByClass);
// Protected writes
router.use(auth_middleware_1.authenticate);
router.post("/", schedule_validator_1.scheduleValidator, validate_middleware_1.validate, schedule_controller_1.ScheduleController.create);
router.put("/:id", schedule_validator_1.scheduleValidator, validate_middleware_1.validate, schedule_controller_1.ScheduleController.update);
router.delete("/:id", schedule_controller_1.ScheduleController.delete);
exports.default = router;
//# sourceMappingURL=schedule.routes.js.map