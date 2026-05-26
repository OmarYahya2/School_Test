import { Router } from "express";
import authRoutes from "./auth.routes";
import classesRoutes from "./classes.routes";
import studentsRoutes from "./students.routes";
import teachersRoutes from "./teachers.routes";
import attendanceRoutes from "./attendance.routes";
import gradesRoutes from "./grades.routes";
import scheduleRoutes from "./schedule.routes";
import filesRoutes from "./files.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/classes", classesRoutes);
router.use("/students", studentsRoutes);
router.use("/teachers", teachersRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/grades", gradesRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/files", filesRoutes);

export default router;
