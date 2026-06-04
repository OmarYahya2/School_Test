import { Request, Response, NextFunction } from "express";
import { TeachersService } from "../services/teachers.service";
import { sendSuccess, sendPaginatedSuccess } from "../utils/response.utils";
import { getPaginationParams } from "../utils/pagination.utils";

export class TeachersController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;

      if (page || limit) {
        const { skip, take, page: p, limit: l } = getPaginationParams(req.query);
        const [teachers, total] = await Promise.all([
          TeachersService.getAllTeachers({ skip, take }),
          TeachersService.countTeachers(),
        ]);
        const totalPages = Math.ceil(total / l);
        return sendPaginatedSuccess(
          res,
          teachers,
          { total, page: p, limit: l, totalPages },
          "Teachers fetched successfully"
        );
      }

      const teachers = await TeachersService.getAllTeachers();
      return sendSuccess(res, teachers, "Teachers fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await TeachersService.getTeacherById(req.params.id);
      return sendSuccess(res, teacher, "Teacher fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const teacher = await TeachersService.createTeacher(req.body);
      return sendSuccess(res, teacher, "Teacher created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await TeachersService.deleteTeacher(req.params.id);
      return sendSuccess(res, null, "Teacher deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // --- Admin Teacher Account Management ---

  static async getAccounts(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await TeachersService.getTeacherAccounts();
      return sendSuccess(res, accounts, "Teacher accounts fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await TeachersService.createTeacherAccount(req.body);
      return sendSuccess(res, account, "Teacher account created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await TeachersService.updateTeacherAccount(req.params.id, req.body);
      return sendSuccess(res, account, "Teacher account updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      await TeachersService.deleteTeacherAccount(req.params.id);
      return sendSuccess(res, null, "Teacher account deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await TeachersService.toggleTeacherStatus(req.params.id);
      return sendSuccess(res, account, "Teacher status updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      await TeachersService.resetTeacherPassword(req.params.id, password);
      return sendSuccess(res, null, "Password reset successfully");
    } catch (error) {
      next(error);
    }
  }

  // --- Assignments ---

  static async getAllAssignments(req: Request, res: Response, next: NextFunction) {
    try {
      const assignments = await TeachersService.getAllAssignments();
      return sendSuccess(res, assignments, "Teacher assignments fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async assignTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const assignment = await TeachersService.assignTeacher(req.body);
      return sendSuccess(res, assignment, "Teacher assigned successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      await TeachersService.removeAssignment(req.params.id);
      return sendSuccess(res, null, "Teacher assignment removed successfully");
    } catch (error) {
      next(error);
    }
  }
}
