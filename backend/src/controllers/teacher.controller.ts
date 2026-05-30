import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { TeacherDashboardService } from "../services/teacher-dashboard.service";
import { sendSuccess } from "../utils/response.utils";

export class TeacherController {
  static async getProfile(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const profile = await TeacherDashboardService.getProfile(req.teacher.id);
      return sendSuccess(res, profile, "Teacher profile fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyStudents(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const students = await TeacherDashboardService.getMyStudents(req.teacher.id);
      return sendSuccess(res, students, "Students fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyClass(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const classId = req.query.classId as string | undefined;
      const classData = await TeacherDashboardService.getMyClass(req.teacher.id, classId);
      return sendSuccess(res, classData, "Class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyGrades(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const grades = await TeacherDashboardService.getMyGrades(req.teacher.id);
      return sendSuccess(res, grades, "Grades fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMySchedule(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const schedule = await TeacherDashboardService.getMySchedule(req.teacher.id);
      return sendSuccess(res, schedule, "Schedule fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyFiles(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const files = await TeacherDashboardService.getMyFiles(req.teacher.id);
      return sendSuccess(res, files, "Files fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyQR(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const classId = req.query.classId as string | undefined;
      const qr = await TeacherDashboardService.getMyQR(req.teacher.id, classId);
      return sendSuccess(res, qr, "QR class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMyAnalytics(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) {
        return res.status(403).json({ success: false, message: "Teacher profile not found" });
      }
      const classId = req.query.classId as string | undefined;
      const analytics = await TeacherDashboardService.getMyAnalytics(req.teacher.id, classId);
      return sendSuccess(res, analytics, "Analytics fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createStudent(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      const student = await TeacherDashboardService.createStudentForTeacher(req.teacher.id, req.body);
      return sendSuccess(res, student, "Student created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateStudent(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      const student = await TeacherDashboardService.updateStudentForTeacher(req.teacher.id, req.params.id, req.body);
      return sendSuccess(res, student, "Student updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteStudent(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      await TeacherDashboardService.deleteStudentForTeacher(req.teacher.id, req.params.id);
      return sendSuccess(res, null, "Student deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createGrade(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      const grade = await TeacherDashboardService.createGradeForTeacher(req.teacher.id, req.body);
      return sendSuccess(res, grade, "Grade created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateGrade(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      const grade = await TeacherDashboardService.updateGradeForTeacher(req.teacher.id, req.params.id, req.body);
      return sendSuccess(res, grade, "Grade updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteGrade(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      await TeacherDashboardService.deleteGradeForTeacher(req.teacher.id, req.params.id);
      return sendSuccess(res, null, "Grade deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async saveAttendance(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      const record = await TeacherDashboardService.saveAttendanceForTeacher(req.teacher.id, req.body);
      return sendSuccess(res, record, "Attendance saved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createFile(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.teacher) return res.status(403).json({ success: false, message: "Teacher profile not found" });
      const file = await TeacherDashboardService.createFileForTeacher(req.teacher.id, req.body);
      return sendSuccess(res, file, "File created successfully", 201);
    } catch (error) {
      next(error);
    }
  }
}
