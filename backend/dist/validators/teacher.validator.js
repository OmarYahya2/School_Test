"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teacherAssignmentValidator = exports.teacherValidator = void 0;
const express_validator_1 = require("express-validator");
exports.teacherValidator = [
    (0, express_validator_1.body)("name")
        .trim()
        .notEmpty()
        .withMessage("Teacher name is required"),
    (0, express_validator_1.body)("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required"),
    (0, express_validator_1.body)("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject is required"),
];
exports.teacherAssignmentValidator = [
    (0, express_validator_1.body)("teacherId")
        .isUUID()
        .withMessage("Teacher ID must be a valid UUID"),
    (0, express_validator_1.body)("gradeId")
        .isInt({ min: 1, max: 12 })
        .withMessage("Grade ID must be an integer between 1 and 12"),
    (0, express_validator_1.body)("semester")
        .isIn(["first", "second"])
        .withMessage("Semester must be either first or second"),
    (0, express_validator_1.body)("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject name is required"),
];
//# sourceMappingURL=teacher.validator.js.map