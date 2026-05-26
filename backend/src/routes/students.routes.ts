import { Router } from "express";
import { StudentsController } from "../controllers/students.controller";
import { studentValidator } from "../validators/student.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", StudentsController.getAll);
router.get("/:id", StudentsController.getById);
router.get("/class/:classId", StudentsController.getByClass);
router.post("/", studentValidator, validate, StudentsController.create);
router.put("/:id", studentValidator, validate, StudentsController.update);
router.delete("/:id", StudentsController.delete);

export default router;
