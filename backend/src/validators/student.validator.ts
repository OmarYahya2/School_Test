import { body } from "express-validator";

export const studentValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Student name is required"),
  body("age")
    .isInt({ min: 3, max: 25 })
    .withMessage("Age must be an integer between 3 and 25"),
  body("classId")
    .isUUID()
    .withMessage("Class ID must be a valid UUID"),
  body("parentPhone")
    .trim()
    .notEmpty()
    .withMessage("Parent phone number is required"),
  body("notes")
    .optional()
    .trim(),
];
