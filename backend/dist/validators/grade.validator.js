"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeValidator = void 0;
const express_validator_1 = require("express-validator");
exports.gradeValidator = [
    (0, express_validator_1.body)("studentId")
        .isUUID()
        .withMessage("Student ID must be a valid UUID"),
    (0, express_validator_1.body)("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject is required"),
    (0, express_validator_1.body)("grade")
        .isFloat({ min: 0 })
        .withMessage("Grade must be a number greater than or equal to 0"),
    (0, express_validator_1.body)("maxGrade")
        .isFloat({ min: 1 })
        .withMessage("Max grade must be a number greater than or equal to 1"),
    (0, express_validator_1.body)("semester")
        .isIn(["first", "second"])
        .withMessage("Semester must be first or second"),
    (0, express_validator_1.body)("academicYear")
        .optional()
        .trim()
        .notEmpty(),
    (0, express_validator_1.body)("examType")
        .isIn(["exam", "quiz", "homework", "project"])
        .withMessage("Exam type must be exam, quiz, homework, or project"),
    (0, express_validator_1.body)("teacherId")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("Teacher ID must be a valid UUID"),
    (0, express_validator_1.body)("notes")
        .optional()
        .trim(),
];
//# sourceMappingURL=grade.validator.js.map