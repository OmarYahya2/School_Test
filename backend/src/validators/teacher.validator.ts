import { body } from "express-validator";

export const teacherValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Teacher name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),
];

export const teacherAssignmentValidator = [
  body("teacherId")
    .isUUID()
    .withMessage("Teacher ID must be a valid UUID"),
  body("gradeId")
    .isInt({ min: 1, max: 12 })
    .withMessage("Grade ID must be an integer between 1 and 12"),
  body("semester")
    .isIn(["first", "second"])
    .withMessage("Semester must be either first or second"),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject name is required"),
];
