import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { StudentsService } from "../services/students.service";
import { sendSuccess, sendPaginatedSuccess, sendError } from "../utils/response.utils";
import { getPaginationParams } from "../utils/pagination.utils";
import { prisma } from "../lib/prisma";

async function isTeacherAssignedToClass(teacherId: string, classId: string): Promise<boolean> {
  console.log("[DEBUG] isTeacherAssignedToClass teacherId=", teacherId, "classId=", classId);
  const assignment = await prisma.teacherAssignment.findFirst({
    where: { teacherId, classId },
  });
  console.log("[DEBUG] assignment=", assignment);
  if (assignment) return true;
  const homeroom = await prisma.class.findFirst({
    where: { teacherId, id: classId },
  });
  console.log("[DEBUG] homeroom=", homeroom);
  return !!homeroom;
}

export class StudentsController {
  static async getAll(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const homeroomClasses = await prisma.class.findMany({
          where: { teacherId: req.teacher.id },
          select: { id: true },
        });
        const assignedClasses = await prisma.teacherAssignment.findMany({
          where: { teacherId: req.teacher.id },
          select: { classId: true },
        });
        const classIds = new Set([
          ...homeroomClasses.map((c) => c.id),
          ...assignedClasses.map((a) => a.classId!).filter(Boolean),
        ]);
        if (classIds.size === 0) {
          return sendSuccess(res, [], "Students fetched successfully");
        }
        const students = await prisma.student.findMany({
          where: { classId: { in: Array.from(classIds) } },
          include: { class: { select: { id: true, name: true } } },
          orderBy: { name: "asc" },
        });
        return sendSuccess(res, students, "Students fetched successfully");
      }

      const { page, limit } = req.query;
      if (page || limit) {
        const { skip, take, page: p, limit: l } = getPaginationParams(req.query);
        const [students, total] = await Promise.all([
          StudentsService.getAllStudents({ skip, take }),
          StudentsService.countStudents(),
        ]);
        const totalPages = Math.ceil(total / l);
        return sendPaginatedSuccess(
          res,
          students,
          { total, page: p, limit: l, totalPages },
          "Students fetched successfully"
        );
      }

      const students = await StudentsService.getAllStudents();
      return sendSuccess(res, students, "Students fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const student = await StudentsService.getStudentById(req.params.id);
      if (req.teacher) {
        const allowed = await isTeacherAssignedToClass(req.teacher.id, student.classId);
        if (!allowed) {
          return sendError(res, "Access denied. This student is not in your class.", 403);
        }
      }
      return sendSuccess(res, student, "Student fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClass(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const allowed = await isTeacherAssignedToClass(req.teacher.id, req.params.classId);
        if (!allowed) {
          return sendError(res, "Access denied. This class is not assigned to you.", 403);
        }
      }
      const students = await StudentsService.getStudentsByClass(req.params.classId);
      return sendSuccess(res, students, "Students for class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const student = await StudentsService.createStudent(req.body);
      return sendSuccess(res, student, "Student created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const student = await StudentsService.updateStudent(req.params.id, req.body);
      return sendSuccess(res, student, "Student updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      await StudentsService.deleteStudent(req.params.id);
      return sendSuccess(res, null, "Student deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
