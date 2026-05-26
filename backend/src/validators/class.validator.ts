import { body } from "express-validator";

export const classValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Class name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Class name must be between 1 and 100 characters"),
  body("teacherId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Teacher ID must be a valid UUID"),
  body("notes")
    .optional()
    .trim(),
];
