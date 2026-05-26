import { Request, Response, NextFunction } from "express";
import { GradesService } from "../services/grades.service";
import { sendSuccess, sendPaginatedSuccess } from "../utils/response.utils";
import { getPaginationParams } from "../utils/pagination.utils";

export class GradesController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
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

  static async getByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const grades = await GradesService.getGradesByStudent(req.params.studentId);
      return sendSuccess(res, grades, "Grades for student fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const grades = await GradesService.getGradesByClass(req.params.classId);
      return sendSuccess(res, grades, "Grades for class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const grade = await GradesService.createGrade(req.body);
      return sendSuccess(res, grade, "Grade record created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const grade = await GradesService.updateGrade(req.params.id, req.body);
      return sendSuccess(res, grade, "Grade record updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await GradesService.deleteGrade(req.params.id);
      return sendSuccess(res, null, "Grade record deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
