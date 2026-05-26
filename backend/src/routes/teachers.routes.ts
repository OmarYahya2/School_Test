import { Router } from "express";
import { TeachersController } from "../controllers/teachers.controller";
import { teacherValidator, teacherAssignmentValidator } from "../validators/teacher.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// For reading assignments/teachers on landing page, some endpoints could be public.
// However, the instructions say the app must be production ready. Let's make teachers public read, but secure for modifications.
router.get("/", TeachersController.getAll);
router.get("/assignments", TeachersController.getAllAssignments);

router.use(authenticate);

router.get("/:id", TeachersController.getById);
router.post("/", teacherValidator, validate, TeachersController.create);
router.delete("/:id", TeachersController.delete);

router.post("/assignments", teacherAssignmentValidator, validate, TeachersController.assignTeacher);
router.delete("/assignments/:id", TeachersController.removeAssignment);

export default router;
