"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const grades_controller_1 = require("../controllers/grades.controller");
const grade_validator_1 = require("../validators/grade.validator");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get("/", grades_controller_1.GradesController.getAll);
router.get("/student/:studentId", grades_controller_1.GradesController.getByStudent);
router.get("/class/:classId", grades_controller_1.GradesController.getByClass);
router.post("/", grade_validator_1.gradeValidator, validate_middleware_1.validate, grades_controller_1.GradesController.create);
router.put("/:id", grade_validator_1.gradeValidator, validate_middleware_1.validate, grades_controller_1.GradesController.update);
router.delete("/:id", grades_controller_1.GradesController.delete);
exports.default = router;
//# sourceMappingURL=grades.routes.js.map