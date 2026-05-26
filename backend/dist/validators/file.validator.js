"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileValidator = void 0;
const express_validator_1 = require("express-validator");
exports.fileValidator = [
    (0, express_validator_1.body)("gradeId")
        .toInt()
        .isInt({ min: 1, max: 12 })
        .withMessage("Grade ID must be an integer between 1 and 12"),
    (0, express_validator_1.body)("semester")
        .isIn(["first", "second"])
        .withMessage("Semester must be first or second"),
    (0, express_validator_1.body)("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject is required"),
    (0, express_validator_1.body)("teacherId")
        .isUUID()
        .withMessage("Teacher ID must be a valid UUID"),
    (0, express_validator_1.body)("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim(),
    (0, express_validator_1.body)("type")
        .isIn(["pdf", "image", "link", "document"])
        .withMessage("File type must be pdf, image, link, or document"),
    (0, express_validator_1.body)("url")
        .optional()
        .trim(),
];
//# sourceMappingURL=file.validator.js.map