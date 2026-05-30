"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const attendance_validator_1 = require("../validators/attendance.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use(auth_middleware_1.injectTeacher);
router.get("/class/:classId", attendance_controller_1.AttendanceController.getByClass);
router.get("/class/:classId/date/:date", attendance_controller_1.AttendanceController.getByClassAndDate);
router.post("/", auth_middleware_1.requireAdminOrActiveTeacher, attendance_validator_1.attendanceValidator, validate_middleware_1.validate, attendance_controller_1.AttendanceController.save);
exports.default = router;
//# sourceMappingURL=attendance.routes.js.map