import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { attendanceValidator } from "../validators/attendance.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/class/:classId", AttendanceController.getByClass);
router.get("/class/:classId/date/:date", AttendanceController.getByClassAndDate);
router.post("/", attendanceValidator, validate, AttendanceController.save);

export default router;
