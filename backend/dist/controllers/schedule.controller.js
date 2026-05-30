"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const schedule_service_1 = require("../services/schedule.service");
const response_utils_1 = require("../utils/response.utils");
const prisma_1 = require("../lib/prisma");
class ScheduleController {
    static async getAll(req, res, next) {
        try {
            if (req.teacher) {
                const items = await prisma_1.prisma.scheduleItem.findMany({
                    where: { teacherId: req.teacher.id },
                    include: { class: { select: { id: true, name: true } } },
                    orderBy: [
                        { dayOfWeek: "asc" },
                        { periodNumber: "asc" },
                    ],
                });
                return (0, response_utils_1.sendSuccess)(res, items, "Schedule items fetched successfully");
            }
            const items = await schedule_service_1.ScheduleService.getAllScheduleItems();
            return (0, response_utils_1.sendSuccess)(res, items, "Schedule items fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getByClass(req, res, next) {
        try {
            if (req.teacher) {
                const teacherClass = await prisma_1.prisma.class.findFirst({ where: { teacherId: req.teacher.id, id: req.params.classId } });
                if (!teacherClass)
                    return (0, response_utils_1.sendError)(res, "Access denied. This class is not assigned to you.", 403);
            }
            const items = await schedule_service_1.ScheduleService.getScheduleByClass(req.params.classId);
            return (0, response_utils_1.sendSuccess)(res, items, "Class schedule fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const item = await schedule_service_1.ScheduleService.createScheduleItem(req.body);
            return (0, response_utils_1.sendSuccess)(res, item, "Schedule item saved successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const item = await schedule_service_1.ScheduleService.updateScheduleItem(req.params.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, item, "Schedule item updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await schedule_service_1.ScheduleService.deleteScheduleItem(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Schedule item deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ScheduleController = ScheduleController;
//# sourceMappingURL=schedule.controller.js.map