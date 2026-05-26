"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attendanceValidator = void 0;
const express_validator_1 = require("express-validator");
exports.attendanceValidator = [
    (0, express_validator_1.body)("classId")
        .isUUID()
        .withMessage("Class ID must be a valid UUID"),
    (0, express_validator_1.body)("date")
        .isISO8601()
        .withMessage("Date must be a valid ISO8601 date (YYYY-MM-DD)"),
    (0, express_validator_1.body)("records")
        .isArray()
        .withMessage("Records must be an array of student presence"),
    (0, express_validator_1.body)("records.*.studentId")
        .isUUID()
        .withMessage("Each record must contain a valid student UUID"),
    (0, express_validator_1.body)("records.*.present")
        .isBoolean()
        .withMessage("Each record must contain present as boolean"),
];
//# sourceMappingURL=attendance.validator.js.map