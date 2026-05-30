import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { ScheduleService } from "../services/schedule.service";
import { sendSuccess, sendError } from "../utils/response.utils";
import { prisma } from "../lib/prisma";

export class ScheduleController {
  static async getAll(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const items = await prisma.scheduleItem.findMany({
          where: { teacherId: req.teacher.id },
          include: { class: { select: { id: true, name: true } } },
          orderBy: [
            { dayOfWeek: "asc" },
            { periodNumber: "asc" },
          ],
        });
        return sendSuccess(res, items, "Schedule items fetched successfully");
      }
      const items = await ScheduleService.getAllScheduleItems();
      return sendSuccess(res, items, "Schedule items fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClass(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (req.teacher) {
        const teacherClass = await prisma.class.findFirst({ where: { teacherId: req.teacher.id, id: req.params.classId } });
        if (!teacherClass) return sendError(res, "Access denied. This class is not assigned to you.", 403);
      }
      const items = await ScheduleService.getScheduleByClass(req.params.classId);
      return sendSuccess(res, items, "Class schedule fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const item = await ScheduleService.createScheduleItem(req.body);
      return sendSuccess(res, item, "Schedule item saved successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const item = await ScheduleService.updateScheduleItem(req.params.id, req.body);
      return sendSuccess(res, item, "Schedule item updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      await ScheduleService.deleteScheduleItem(req.params.id);
      return sendSuccess(res, null, "Schedule item deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
