import { Router } from "express";
import { GradesController } from "../controllers/grades.controller";
import { gradeValidator } from "../validators/grade.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", GradesController.getAll);
router.get("/student/:studentId", GradesController.getByStudent);
router.get("/class/:classId", GradesController.getByClass);
router.post("/", gradeValidator, validate, GradesController.create);
router.put("/:id", gradeValidator, validate, GradesController.update);
router.delete("/:id", GradesController.delete);

export default router;
