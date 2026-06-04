"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesController = void 0;
const classes_service_1 = require("../services/classes.service");
const response_utils_1 = require("../utils/response.utils");
const pagination_utils_1 = require("../utils/pagination.utils");
const prisma_1 = require("../lib/prisma");
class ClassesController {
    static async getAll(req, res, next) {
        try {
            if (req.teacher) {
                const classes = await prisma_1.prisma.class.findMany({
                    where: { teacherId: req.teacher.id },
                    include: {
                        teacher: { select: { id: true, name: true, phone: true, subject: true } },
                        _count: { select: { students: true } },
                    },
                    orderBy: { name: "asc" },
                });
                return (0, response_utils_1.sendSuccess)(res, classes, "Classes fetched successfully");
            }
            const { page, limit } = req.query;
            if (page || limit) {
                const { skip, take, page: p, limit: l } = (0, pagination_utils_1.getPaginationParams)(req.query);
                const [classes, total] = await Promise.all([
                    classes_service_1.ClassesService.getAllClasses({ skip, take }),
                    classes_service_1.ClassesService.countClasses(),
                ]);
                const totalPages = Math.ceil(total / l);
                return (0, response_utils_1.sendPaginatedSuccess)(res, classes, { total, page: p, limit: l, totalPages }, "Classes fetched successfully");
            }
            const classes = await classes_service_1.ClassesService.getAllClasses();
            return (0, response_utils_1.sendSuccess)(res, classes, "Classes fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const schoolClass = await classes_service_1.ClassesService.getClassById(req.params.id);
            if (req.teacher && schoolClass.teacherId !== req.teacher.id) {
                return (0, response_utils_1.sendError)(res, "Access denied. This class is not assigned to you.", 403);
            }
            return (0, response_utils_1.sendSuccess)(res, schoolClass, "Class fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const schoolClass = await classes_service_1.ClassesService.createClass(req.body);
            return (0, response_utils_1.sendSuccess)(res, schoolClass, "Class created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const schoolClass = await classes_service_1.ClassesService.updateClass(req.params.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, schoolClass, "Class updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await classes_service_1.ClassesService.deleteClass(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Class deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ClassesController = ClassesController;
//# sourceMappingURL=classes.controller.js.map