"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const response_utils_1 = require("../utils/response.utils");
class AnalyticsController {
    static async getSummary(req, res, next) {
        try {
            const summary = await analytics_service_1.AnalyticsService.getSummary();
            return (0, response_utils_1.sendSuccess)(res, summary, "Analytics summary fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map