import { Router } from "express";
import { ClassesController } from "../controllers/classes.controller";
import { classValidator } from "../validators/class.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate, injectTeacher, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(injectTeacher);

router.get("/", ClassesController.getAll);
router.get("/:id", ClassesController.getById);
router.post("/", requireAdmin, classValidator, validate, ClassesController.create);
router.put("/:id", requireAdmin, classValidator, validate, ClassesController.update);
router.delete("/:id", requireAdmin, ClassesController.delete);

export default router;
