import { Router } from "express";
import { GradesController } from "../controllers/grades.controller";
import { gradeValidator } from "../validators/grade.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate, injectTeacher, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(injectTeacher);

router.get("/", GradesController.getAll);
router.get("/student/:studentId", GradesController.getByStudent);
router.get("/class/:classId", GradesController.getByClass);
router.post("/", requireAdmin, gradeValidator, validate, GradesController.create);
router.put("/:id", requireAdmin, gradeValidator, validate, GradesController.update);
router.delete("/:id", requireAdmin, GradesController.delete);

export default router;
