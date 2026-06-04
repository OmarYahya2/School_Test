import { Router } from "express";
import { TeacherController } from "../controllers/teacher.controller";
import { authenticate, injectTeacher, requireTeacher } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);
router.use(requireTeacher);
router.use(injectTeacher);

router.get("/me", TeacherController.getProfile);
router.get("/students", TeacherController.getMyStudents);
router.post("/students", TeacherController.createStudent);
router.put("/students/:id", TeacherController.updateStudent);
router.delete("/students/:id", TeacherController.deleteStudent);
router.get("/class", TeacherController.getMyClass);
router.get("/grades", TeacherController.getMyGrades);
router.post("/grades", TeacherController.createGrade);
router.put("/grades/:id", TeacherController.updateGrade);
router.delete("/grades/:id", TeacherController.deleteGrade);
router.get("/schedule", TeacherController.getMySchedule);
router.post("/attendance", TeacherController.saveAttendance);
router.get("/files", TeacherController.getMyFiles);
router.post("/files", TeacherController.createFile);
router.put("/files/:id", TeacherController.updateFile);
router.delete("/files/:id", TeacherController.deleteFile);
router.get("/qr", TeacherController.getMyQR);
router.get("/analytics", TeacherController.getMyAnalytics);

export default router;
