"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teachers_controller_1 = require("../controllers/teachers.controller");
const teacher_validator_1 = require("../validators/teacher.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// For reading assignments/teachers on landing page, some endpoints could be public.
// However, the instructions say the app must be production ready. Let's make teachers public read, but secure for modifications.
router.get("/", teachers_controller_1.TeachersController.getAll);
router.get("/assignments", teachers_controller_1.TeachersController.getAllAssignments);
router.use(auth_middleware_1.authenticate);
router.get("/:id", teachers_controller_1.TeachersController.getById);
router.post("/", teacher_validator_1.teacherValidator, validate_middleware_1.validate, teachers_controller_1.TeachersController.create);
router.delete("/:id", teachers_controller_1.TeachersController.delete);
router.post("/assignments", teacher_validator_1.teacherAssignmentValidator, validate_middleware_1.validate, teachers_controller_1.TeachersController.assignTeacher);
router.delete("/assignments/:id", teachers_controller_1.TeachersController.removeAssignment);
exports.default = router;
//# sourceMappingURL=teachers.routes.js.map