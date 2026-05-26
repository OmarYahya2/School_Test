import { Request, Response, NextFunction } from "express";
import { StudentsService } from "../services/students.service";
import { sendSuccess, sendPaginatedSuccess } from "../utils/response.utils";
import { getPaginationParams } from "../utils/pagination.utils";

export class StudentsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
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

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await StudentsService.getStudentById(req.params.id);
      return sendSuccess(res, student, "Student fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await StudentsService.getStudentsByClass(req.params.classId);
      return sendSuccess(res, students, "Students for class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await StudentsService.createStudent(req.body);
      return sendSuccess(res, student, "Student created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await StudentsService.updateStudent(req.params.id, req.body);
      return sendSuccess(res, student, "Student updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await StudentsService.deleteStudent(req.params.id);
      return sendSuccess(res, null, "Student deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
