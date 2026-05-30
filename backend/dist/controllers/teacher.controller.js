"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const teacher_dashboard_service_1 = require("../services/teacher-dashboard.service");
const response_utils_1 = require("../utils/response.utils");
class TeacherController {
    static async getProfile(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const profile = await teacher_dashboard_service_1.TeacherDashboardService.getProfile(req.teacher.id);
            return (0, response_utils_1.sendSuccess)(res, profile, "Teacher profile fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyStudents(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const students = await teacher_dashboard_service_1.TeacherDashboardService.getMyStudents(req.teacher.id);
            return (0, response_utils_1.sendSuccess)(res, students, "Students fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyClass(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const classId = req.query.classId;
            const classData = await teacher_dashboard_service_1.TeacherDashboardService.getMyClass(req.teacher.id, classId);
            return (0, response_utils_1.sendSuccess)(res, classData, "Class fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyGrades(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const grades = await teacher_dashboard_service_1.TeacherDashboardService.getMyGrades(req.teacher.id);
            return (0, response_utils_1.sendSuccess)(res, grades, "Grades fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getMySchedule(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const schedule = await teacher_dashboard_service_1.TeacherDashboardService.getMySchedule(req.teacher.id);
            return (0, response_utils_1.sendSuccess)(res, schedule, "Schedule fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyFiles(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const files = await teacher_dashboard_service_1.TeacherDashboardService.getMyFiles(req.teacher.id);
            return (0, response_utils_1.sendSuccess)(res, files, "Files fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyQR(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const classId = req.query.classId;
            const qr = await teacher_dashboard_service_1.TeacherDashboardService.getMyQR(req.teacher.id, classId);
            return (0, response_utils_1.sendSuccess)(res, qr, "QR class fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyAnalytics(req, res, next) {
        try {
            if (!req.teacher) {
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            }
            const classId = req.query.classId;
            const analytics = await teacher_dashboard_service_1.TeacherDashboardService.getMyAnalytics(req.teacher.id, classId);
            return (0, response_utils_1.sendSuccess)(res, analytics, "Analytics fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async createStudent(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            const student = await teacher_dashboard_service_1.TeacherDashboardService.createStudentForTeacher(req.teacher.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, student, "Student created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStudent(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            const student = await teacher_dashboard_service_1.TeacherDashboardService.updateStudentForTeacher(req.teacher.id, req.params.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, student, "Student updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteStudent(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            await teacher_dashboard_service_1.TeacherDashboardService.deleteStudentForTeacher(req.teacher.id, req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Student deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async createGrade(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            const grade = await teacher_dashboard_service_1.TeacherDashboardService.createGradeForTeacher(req.teacher.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, grade, "Grade created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateGrade(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            const grade = await teacher_dashboard_service_1.TeacherDashboardService.updateGradeForTeacher(req.teacher.id, req.params.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, grade, "Grade updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteGrade(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            await teacher_dashboard_service_1.TeacherDashboardService.deleteGradeForTeacher(req.teacher.id, req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Grade deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async saveAttendance(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            const record = await teacher_dashboard_service_1.TeacherDashboardService.saveAttendanceForTeacher(req.teacher.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, record, "Attendance saved successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async createFile(req, res, next) {
        try {
            if (!req.teacher)
                return res.status(403).json({ success: false, message: "Teacher profile not found" });
            const file = await teacher_dashboard_service_1.TeacherDashboardService.createFileForTeacher(req.teacher.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, file, "File created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TeacherController = TeacherController;
//# sourceMappingURL=teacher.controller.js.map