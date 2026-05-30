import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { AnalyticsService } from "../services/analytics.service";
import { sendSuccess } from "../utils/response.utils";

export class AnalyticsController {
  static async getSummary(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const summary = await AnalyticsService.getSummary();
      return sendSuccess(res, summary, "Analytics summary fetched successfully");
    } catch (error) {
      next(error);
    }
  }
}
