import { Request, Response, NextFunction } from "express";
import { ClassesService } from "../services/classes.service";
import { sendSuccess, sendPaginatedSuccess } from "../utils/response.utils";
import { getPaginationParams } from "../utils/pagination.utils";

export class ClassesController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;

      if (page || limit) {
        const { skip, take, page: p, limit: l } = getPaginationParams(req.query);
        const [classes, total] = await Promise.all([
          ClassesService.getAllClasses({ skip, take }),
          ClassesService.countClasses(),
        ]);
        const totalPages = Math.ceil(total / l);
        return sendPaginatedSuccess(
          res,
          classes,
          { total, page: p, limit: l, totalPages },
          "Classes fetched successfully"
        );
      }

      const classes = await ClassesService.getAllClasses();
      return sendSuccess(res, classes, "Classes fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolClass = await ClassesService.getClassById(req.params.id);
      return sendSuccess(res, schoolClass, "Class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolClass = await ClassesService.createClass(req.body);
      return sendSuccess(res, schoolClass, "Class created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const schoolClass = await ClassesService.updateClass(req.params.id, req.body);
      return sendSuccess(res, schoolClass, "Class updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ClassesService.deleteClass(req.params.id);
      return sendSuccess(res, null, "Class deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
