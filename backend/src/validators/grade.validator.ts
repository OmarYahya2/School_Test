import { body } from "express-validator";

export const gradeValidator = [
  body("studentId")
    .isUUID()
    .withMessage("Student ID must be a valid UUID"),
  body("subject")
    .trim()
    .notEmpty()
    .withMessage("Subject is required"),
  body("grade")
    .isFloat({ min: 0 })
    .withMessage("Grade must be a number greater than or equal to 0"),
  body("maxGrade")
    .isFloat({ min: 1 })
    .withMessage("Max grade must be a number greater than or equal to 1"),
  body("semester")
    .isIn(["first", "second"])
    .withMessage("Semester must be first or second"),
  body("academicYear")
    .optional()
    .trim()
    .notEmpty(),
  body("examType")
    .isIn(["exam", "quiz", "homework", "project"])
    .withMessage("Exam type must be exam, quiz, homework, or project"),
  body("teacherId")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Teacher ID must be a valid UUID"),
  body("notes")
    .optional()
    .trim(),
];
