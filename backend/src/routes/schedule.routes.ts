import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";
import { scheduleValidator } from "../validators/schedule.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate, injectTeacher, requireAdmin } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

const publicLimiter = rateLimit({ windowMs: 60 * 1000, maxHits: 300, keyPrefix: "schedule-pub" });

router.use(authenticate);
router.use(injectTeacher);

router.get("/", publicLimiter, ScheduleController.getAll);
router.get("/class/:classId", publicLimiter, ScheduleController.getByClass);

router.post("/", requireAdmin, scheduleValidator, validate, ScheduleController.create);
router.put("/:id", requireAdmin, scheduleValidator, validate, ScheduleController.update);
router.delete("/:id", requireAdmin, ScheduleController.delete);

export default router;
