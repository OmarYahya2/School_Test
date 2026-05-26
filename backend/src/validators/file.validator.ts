import { body } from "express-validator";

export const fileValidator = [
  body("gradeId")
    .toInt()
    .isInt({ min: 1, max: 12 })
    .withMessage("Grade ID must be an integer between 1 and 12"),
  body("semester")
    .isIn(["first", "second"])
    .withMessage("Semester must be first or second"),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),
  body("teacherId")
    .isUUID()
    .withMessage("Teacher ID must be a valid UUID"),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("description")
    .optional()
    .trim(),
  body("type")
    .isIn(["pdf", "image", "link", "document"])
    .withMessage("File type must be pdf, image, link, or document"),
  body("url")
    .optional()
    .trim(),
];
