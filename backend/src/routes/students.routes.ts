import { Router } from "express";
import { StudentsController } from "../controllers/students.controller";
import { studentValidator } from "../validators/student.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate, injectTeacher, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(injectTeacher);

router.get("/", StudentsController.getAll);
router.get("/:id", StudentsController.getById);
router.get("/class/:classId", StudentsController.getByClass);
router.post("/", requireAdmin, studentValidator, validate, StudentsController.create);
router.put("/:id", requireAdmin, studentValidator, validate, StudentsController.update);
router.delete("/:id", requireAdmin, StudentsController.delete);

export default router;
