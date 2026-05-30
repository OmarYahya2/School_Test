"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradesController = void 0;
const grades_service_1 = require("../services/grades.service");
const response_utils_1 = require("../utils/response.utils");
const pagination_utils_1 = require("../utils/pagination.utils");
const prisma_1 = require("../lib/prisma");
async function isTeacherAssignedToClass(teacherId, classId) {
    const assignment = await prisma_1.prisma.teacherAssignment.findFirst({
        where: { teacherId, classId },
    });
    if (assignment)
        return true;
    const homeroom = await prisma_1.prisma.class.findFirst({
        where: { teacherId, id: classId },
    });
    return !!homeroom;
}
class GradesController {
    static async getAll(req, res, next) {
        try {
            if (req.teacher) {
                const grades = await prisma_1.prisma.grade.findMany({
                    where: { teacherId: req.teacher.id },
                    include: {
                        student: { select: { id: true, name: true, classId: true } },
                        teacher: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: "desc" },
                });
                return (0, response_utils_1.sendSuccess)(res, grades, "Grades fetched successfully");
            }
            const { page, limit } = req.query;
            if (page || limit) {
                const { skip, take, page: p, limit: l } = (0, pagination_utils_1.getPaginationParams)(req.query);
                const [grades, total] = await Promise.all([
                    grades_service_1.GradesService.getAllGrades({ skip, take }),
                    grades_service_1.GradesService.countGrades(),
                ]);
                const totalPages = Math.ceil(total / l);
                return (0, response_utils_1.sendPaginatedSuccess)(res, grades, { total, page: p, limit: l, totalPages }, "Grades fetched successfully");
            }
            const grades = await grades_service_1.GradesService.getAllGrades();
            return (0, response_utils_1.sendSuccess)(res, grades, "Grades fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getByStudent(req, res, next) {
        try {
            if (req.teacher) {
                const student = await prisma_1.prisma.student.findUnique({ where: { id: req.params.studentId }, select: { classId: true } });
                if (!student)
                    return (0, response_utils_1.sendError)(res, "Student not found.", 404);
                const allowed = await isTeacherAssignedToClass(req.teacher.id, student.classId);
                if (!allowed)
                    return (0, response_utils_1.sendError)(res, "Access denied. This student is not in your class.", 403);
            }
            const grades = await grades_service_1.GradesService.getGradesByStudent(req.params.studentId);
            return (0, response_utils_1.sendSuccess)(res, grades, "Grades for student fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getByClass(req, res, next) {
        try {
            if (req.teacher) {
                const allowed = await isTeacherAssignedToClass(req.teacher.id, req.params.classId);
                if (!allowed)
                    return (0, response_utils_1.sendError)(res, "Access denied. This class is not assigned to you.", 403);
            }
            const grades = await grades_service_1.GradesService.getGradesByClass(req.params.classId);
            return (0, response_utils_1.sendSuccess)(res, grades, "Grades for class fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const grade = await grades_service_1.GradesService.createGrade(req.body);
            return (0, response_utils_1.sendSuccess)(res, grade, "Grade record created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const grade = await grades_service_1.GradesService.updateGrade(req.params.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, grade, "Grade record updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await grades_service_1.GradesService.deleteGrade(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Grade record deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GradesController = GradesController;
//# sourceMappingURL=grades.controller.js.map