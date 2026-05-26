import { Router } from "express";
import { ClassesController } from "../controllers/classes.controller";
import { classValidator } from "../validators/class.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", ClassesController.getAll);
router.get("/:id", ClassesController.getById);
router.post("/", classValidator, validate, ClassesController.create);
router.put("/:id", classValidator, validate, ClassesController.update);
router.delete("/:id", ClassesController.delete);

export default router;
