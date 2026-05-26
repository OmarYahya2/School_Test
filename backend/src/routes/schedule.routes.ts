import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { scheduleValidator } from "../validators/schedule.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public reads
router.get("/", ScheduleController.getAll);
router.get("/class/:classId", ScheduleController.getByClass);

// Protected writes
router.use(authenticate);
router.post("/", scheduleValidator, validate, ScheduleController.create);
router.put("/:id", scheduleValidator, validate, ScheduleController.update);
router.delete("/:id", ScheduleController.delete);

export default router;
