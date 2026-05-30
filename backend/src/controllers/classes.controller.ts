import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { ClassesService } from "../services/classes.service";
import { sendSuccess, sendPaginatedSuccess, sendError } from "../utils/response.utils";
import { getPaginationParams } from "../utils/pagination.utils";
import { prisma } from "../lib/prisma";

export class ClassesController {
  static async getAll(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const classes = await prisma.class.findMany({
          where: { teacherId: req.teacher.id },
          include: {
            teacher: { select: { id: true, name: true, phone: true, subject: true } },
            _count: { select: { students: true } },
          },
          orderBy: { name: "asc" },
        });
        return sendSuccess(res, classes, "Classes fetched successfully");
      }

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

  static async getById(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const schoolClass = await ClassesService.getClassById(req.params.id);
      if (req.teacher && schoolClass.teacherId !== req.teacher.id) {
        return sendError(res, "Access denied. This class is not assigned to you.", 403);
      }
      return sendSuccess(res, schoolClass, "Class fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const schoolClass = await ClassesService.createClass(req.body);
      return sendSuccess(res, schoolClass, "Class created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const schoolClass = await ClassesService.updateClass(req.params.id, req.body);
      return sendSuccess(res, schoolClass, "Class updated successfully");
    } catch (error: any) {
      console.error("[ClassesController.update] error:", error?.message || error, "body:", req.body);
      next(error);
    }
  }

  static async delete(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      await ClassesService.deleteClass(req.params.id);
      return sendSuccess(res, null, "Class deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
