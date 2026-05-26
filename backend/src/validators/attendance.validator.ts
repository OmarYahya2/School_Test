import { body } from "express-validator";

export const attendanceValidator = [
  body("classId")
    .isUUID()
    .withMessage("Class ID must be a valid UUID"),
  body("date")
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date (YYYY-MM-DD)"),
  body("records")
    .isArray()
    .withMessage("Records must be an array of student presence"),
  body("records.*.studentId")
    .isUUID()
    .withMessage("Each record must contain a valid student UUID"),
  body("records.*.present")
    .isBoolean()
    .withMessage("Each record must contain present as boolean"),
];
