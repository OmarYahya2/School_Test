import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { attendanceValidator } from "../validators/attendance.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate, injectTeacher, requireAdminOrActiveTeacher } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(injectTeacher);

router.get("/class/:classId", AttendanceController.getByClass);
router.get("/class/:classId/date/:date", AttendanceController.getByClassAndDate);
router.post("/", requireAdminOrActiveTeacher, attendanceValidator, validate, AttendanceController.save);

export default router;
