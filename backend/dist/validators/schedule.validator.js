"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleValidator = void 0;
const express_validator_1 = require("express-validator");
exports.scheduleValidator = [
    (0, express_validator_1.body)("classId")
        .isUUID()
        .withMessage("Class ID must be a valid UUID"),
    (0, express_validator_1.body)("semester")
        .isInt({ min: 1, max: 2 })
        .withMessage("Semester must be 1 or 2"),
    (0, express_validator_1.body)("dayOfWeek")
        .isInt({ min: 0, max: 4 })
        .withMessage("Day of week must be between 0 (Sunday) and 4 (Thursday)"),
    (0, express_validator_1.body)("periodNumber")
        .isInt({ min: 1, max: 8 })
        .withMessage("Period number must be between 1 and 8"),
    (0, express_validator_1.body)("subject")
        .trim()
        .notEmpty()
        .withMessage("Subject is required"),
    (0, express_validator_1.body)("teacherId")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("Teacher ID must be a valid UUID"),
    (0, express_validator_1.body)("startTime")
        .trim()
        .notEmpty()
        .withMessage("Start time is required"),
    (0, express_validator_1.body)("endTime")
        .trim()
        .notEmpty()
        .withMessage("End time is required"),
];
//# sourceMappingURL=schedule.validator.js.map