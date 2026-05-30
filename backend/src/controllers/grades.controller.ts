import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { GradesService } from "../services/grades.service";
import { sendSuccess, sendPaginatedSuccess, sendError } from "../utils/response.utils";
import { getPaginationParams } from "../utils/pagination.utils";
import { prisma } from "../lib/prisma";

async function isTeacherAssignedToClass(teacherId: string, classId: string): Promise<boolean> {
  const assignment = await prisma.teacherAssignment.findFirst({
    where: { teacherId, classId },
  });
  if (assignment) return true;
  const homeroom = await prisma.class.findFirst({
    where: { teacherId, id: classId },
  });
  return !!homeroom;
}

export class GradesController {
  static async getAll(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const grades = await prisma.grade.findMany({
          where: { teacherId: req.teacher.id },
          include: {
            student: { select: { id: true, name: true, classId: true } },
            teacher: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        });
        return sendSuccess(res, grades, "Grades fetched successfully");
      }

      const { page, limit } = req.query;
      if (page || limit) {
        const { skip, take, page: p, limit: l } = getPaginationParams(req.query);
        const [grades, total] = await Promise.all([
          GradesService.getAllGrades({ skip, take }),
          GradesService.countGrades(),
        ]);
        const totalPages = Math.ceil(total / l);
        return sendPaginatedSuccess(
          res,
          grades,
          { total, page: p, limit: l, totalPages },
          "Grades fetched successfully"
        );
      }

      const grades = await GradesService.getAllGrades();
      return sendSuccess(res, grades, "Grades fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByStudent(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const student = await prisma.student.findUnique({ where: { id: req.params.studentId }, select: { classId: true } });
        if (!student) return sendError(res, "Student not found.", 404);
        const allowed = await isTeacherAssignedToClass(req.teacher.id, student.classId);
        if (!allowed) return sendError(res, "Access denied. This student is not in your class.", 403);
      }
      const grades = await GradesService.getGradesByStudent(req.params.studentId);
      return sendSuccess(res, grades, "Grades for student fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClass(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const allowed = await isTeacherAssignedToClass(req.teacher.id, req.params.classId);
        if (!allowed) return sendError(res, "Access denied. This class is not assigned to you.", 403);
      }
      const grades = await GradesService.getGradesByClass(req.params.classId);
      return sendSuccess(res, grades, "Grades for class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const grade = await GradesService.createGrade(req.body);
      return sendSuccess(res, grade, "Grade record created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const grade = await GradesService.updateGrade(req.params.id, req.body);
      return sendSuccess(res, grade, "Grade record updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      await GradesService.deleteGrade(req.params.id);
      return sendSuccess(res, null, "Grade record deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
