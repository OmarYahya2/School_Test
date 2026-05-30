"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const students_controller_1 = require("../controllers/students.controller");
const student_validator_1 = require("../validators/student.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.use(auth_middleware_1.injectTeacher);
router.get("/", students_controller_1.StudentsController.getAll);
router.get("/:id", students_controller_1.StudentsController.getById);
router.get("/class/:classId", students_controller_1.StudentsController.getByClass);
router.post("/", auth_middleware_1.requireAdmin, student_validator_1.studentValidator, validate_middleware_1.validate, students_controller_1.StudentsController.create);
router.put("/:id", auth_middleware_1.requireAdmin, student_validator_1.studentValidator, validate_middleware_1.validate, students_controller_1.StudentsController.update);
router.delete("/:id", auth_middleware_1.requireAdmin, students_controller_1.StudentsController.delete);
exports.default = router;
//# sourceMappingURL=students.routes.js.map