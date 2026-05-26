import { Request, Response, NextFunction } from "express";
import { ScheduleService } from "../services/schedule.service";
import { sendSuccess } from "../utils/response.utils";

export class ScheduleController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ScheduleService.getAllScheduleItems();
      return sendSuccess(res, items, "Schedule items fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getByClass(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ScheduleService.getScheduleByClass(req.params.classId);
      return sendSuccess(res, items, "Class schedule fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ScheduleService.createScheduleItem(req.body);
      return sendSuccess(res, item, "Schedule item saved successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ScheduleService.updateScheduleItem(req.params.id, req.body);
      return sendSuccess(res, item, "Schedule item updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ScheduleService.deleteScheduleItem(req.params.id);
      return sendSuccess(res, null, "Schedule item deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
