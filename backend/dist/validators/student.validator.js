"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentValidator = void 0;
const express_validator_1 = require("express-validator");
exports.studentValidator = [
    (0, express_validator_1.body)("name")
        .trim()
        .notEmpty()
        .withMessage("Student name is required"),
    (0, express_validator_1.body)("age")
        .isInt({ min: 3, max: 25 })
        .withMessage("Age must be an integer between 3 and 25"),
    (0, express_validator_1.body)("classId")
        .isUUID()
        .withMessage("Class ID must be a valid UUID"),
    (0, express_validator_1.body)("parentPhone")
        .trim()
        .notEmpty()
        .withMessage("Parent phone number is required"),
    (0, express_validator_1.body)("notes")
        .optional()
        .trim(),
];
//# sourceMappingURL=student.validator.js.map