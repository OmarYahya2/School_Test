"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("../services/attendance.service");
const response_utils_1 = require("../utils/response.utils");
class AttendanceController {
    static async getByClass(req, res, next) {
        try {
            const records = await attendance_service_1.AttendanceService.getAttendanceByClass(req.params.classId);
            return (0, response_utils_1.sendSuccess)(res, records, "Attendance records fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getByClassAndDate(req, res, next) {
        try {
            const record = await attendance_service_1.AttendanceService.getAttendanceByClassAndDate(req.params.classId, req.params.date);
            return (0, response_utils_1.sendSuccess)(res, record, "Attendance record for date fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async save(req, res, next) {
        try {
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