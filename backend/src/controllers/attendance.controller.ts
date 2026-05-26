import { Request, Response, NextFunction } from "express";
import { AttendanceService } from "../services/attendance.service";
import { sendSuccess } from "../utils/response.utils";

export class AttendanceController {
  static async getByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await AttendanceService.getAttendanceByClass(req.params.classId);
      return sendSuccess(res, records, "Attendance records fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClassAndDate(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await AttendanceService.getAttendanceByClassAndDate(
        req.params.classId,
        req.params.date
      );
      return sendSuccess(res, record, "Attendance record for date fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async save(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await AttendanceService.saveAttendance(req.body);
      return sendSuccess(res, record, "Attendance saved successfully");
    } catch (error) {
      next(error);
    }
  }
}
