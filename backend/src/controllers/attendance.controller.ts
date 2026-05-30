import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { AttendanceService } from "../services/attendance.service";
import { sendSuccess, sendError } from "../utils/response.utils";
import { prisma } from "../lib/prisma";

async function isTeacherAssignedToClass(teacherId: string, classId: string): Promise<boolean> {
  // Check via TeacherAssignment
  const assignment = await prisma.teacherAssignment.findFirst({
    where: { teacherId, classId },
  });
  if (assignment) return true;
  // Fallback: direct homeroom teacher
  const homeroom = await prisma.class.findFirst({
    where: { teacherId, id: classId },
  });
  return !!homeroom;
}

export class AttendanceController {
  static async getByClass(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const allowed = await isTeacherAssignedToClass(req.teacher.id, req.params.classId);
        if (!allowed) return sendError(res, "Access denied. This class is not assigned to you.", 403);
      }
      const records = await AttendanceService.getAttendanceByClass(req.params.classId);
      return sendSuccess(res, records, "Attendance records fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClassAndDate(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const allowed = await isTeacherAssignedToClass(req.teacher.id, req.params.classId);
        if (!allowed) return sendError(res, "Access denied. This class is not assigned to you.", 403);
      }
      const record = await AttendanceService.getAttendanceByClassAndDate(
        req.params.classId,
        req.params.date
      );
      return sendSuccess(res, record, "Attendance record for date fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async save(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const allowed = await isTeacherAssignedToClass(req.teacher.id, req.body.classId);
        if (!allowed) return sendError(res, "Access denied. You can only save attendance for your assigned class.", 403);
      }
      const record = await AttendanceService.saveAttendance(req.body);
      return sendSuccess(res, record, "Attendance saved successfully");
    } catch (error) {
      next(error);
    }
  }
}
