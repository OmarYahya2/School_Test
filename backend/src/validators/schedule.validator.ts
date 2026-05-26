import { body } from "express-validator";

export const scheduleValidator = [
  body("classId")
    .isUUID()
    .withMessage("Class ID must be a valid UUID"),
  body("semester")
    .isInt({ min: 1, max: 2 })
    .withMessage("Semester must be 1 or 2"),
  body("dayOfWeek")
    .isInt({ min: 0, max: 4 })
    .withMessage("Day of week must be between 0 (Sunday) and 4 (Thursday)"),
  body("periodNumber")
    .isInt({ min: 1, max: 8 })
    .withMessage("Period number must be between 1 and 8"),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),
  body("teacherId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Teacher ID must be a valid UUID"),
  body("startTime")
    .trim()
    .notEmpty()
    .withMessage("Start time is required"),
  body("endTime")
    .trim()
    .notEmpty()
    .withMessage("End time is required"),
];
