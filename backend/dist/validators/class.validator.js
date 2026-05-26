"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classValidator = void 0;
const express_validator_1 = require("express-validator");
exports.classValidator = [
    (0, express_validator_1.body)("name")
        .trim()
        .notEmpty()
        .withMessage("Class name is required")
        .isLength({ min: 1, max: 100 })
        .withMessage("Class name must be between 1 and 100 characters"),
    (0, express_validator_1.body)("teacherId")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("Teacher ID must be a valid UUID"),
    (0, express_validator_1.body)("notes")
        .optional()
        .trim(),
];
//# sourceMappingURL=class.validator.js.map