"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("../services/attendance.service");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = require("../lib/prisma");
async function isTeacherAssignedToClass(teacherId, classId) {
    // Check via TeacherAssignment
    const assignment = await prisma_1.prisma.teacherAssignment.findFirst({
        where: { teacherId, classId },
    });
    if (assignment)
        return true;
    // Fallback: direct homeroom teacher
    const homeroom = await prisma_1.prisma.class.findFirst({
        where: { teacherId, id: classId },
    });
    return !!homeroom;
}
class AttendanceController {
    static async getByClass(req, res, next) {
        try {
            if (req.teacher) {
                const allowed = await isTeacherAssignedToClass(req.teacher.id, req.params.classId);
                if (!allowed)
                    return (0, response_utils_1.sendError)(res, "Access denied. This class is not assigned to you.", 403);
            }
            const records = await attendance_service_1.AttendanceService.getAttendanceByClass(req.params.classId);
            return (0, response_utils_1.sendSuccess)(res, records, "Attendance records fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getByClassAndDate(req, res, next) {
        try {
            if (req.teacher) {
                const allowed = await isTeacherAssignedToClass(req.teacher.id, req.params.classId);
                if (!allowed)
                    return (0, response_utils_1.sendError)(res, "Access denied. This class is not assigned to you.", 403);
            }
            const record = await attendance_service_1.AttendanceService.getAttendanceByClassAndDate(req.params.classId, req.params.date);
            return (0, response_utils_1.sendSuccess)(res, record, "Attendance record for date fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async save(req, res, next) {
        try {
            if (req.teacher) {
                const allowed = await isTeacherAssignedToClass(req.teacher.id, req.body.classId);
                if (!allowed)
                    return (0, response_utils_1.sendError)(res, "Access denied. You can only save attendance for your assigned class.", 403);
            }
            const record = await attendance_service_1.AttendanceService.saveAttendance(req.body);
            return (0, response_utils_1.sendSuccess)(res, record, "Attendance saved successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AttendanceController = AttendanceController;
//# sourceMappingURL=attendance.controller.js.map