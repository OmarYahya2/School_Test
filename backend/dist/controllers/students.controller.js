"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsController = void 0;
const students_service_1 = require("../services/students.service");
const response_utils_1 = require("../utils/response.utils");
const pagination_utils_1 = require("../utils/pagination.utils");
class StudentsController {
    static async getAll(req, res, next) {
        try {
            const { page, limit } = req.query;
            if (page || limit) {
                const { skip, take, page: p, limit: l } = (0, pagination_utils_1.getPaginationParams)(req.query);
                const [students, total] = await Promise.all([
                    students_service_1.StudentsService.getAllStudents({ skip, take }),
                    students_service_1.StudentsService.countStudents(),
                ]);
                const totalPages = Math.ceil(total / l);
                return (0, response_utils_1.sendPaginatedSuccess)(res, students, { total, page: p, limit: l, totalPages }, "Students fetched successfully");
            }
            const students = await students_service_1.StudentsService.getAllStudents();
            return (0, response_utils_1.sendSuccess)(res, students, "Students fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const student = await students_service_1.StudentsService.getStudentById(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, student, "Student fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getByClass(req, res, next) {
        try {
            const students = await students_service_1.StudentsService.getStudentsByClass(req.params.classId);
            return (0, response_utils_1.sendSuccess)(res, students, "Students for class fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const student = await students_service_1.StudentsService.createStudent(req.body);
            return (0, response_utils_1.sendSuccess)(res, student, "Student created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const student = await students_service_1.StudentsService.updateStudent(req.params.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, student, "Student updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await students_service_1.StudentsService.deleteStudent(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Student deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.StudentsController = StudentsController;
//# sourceMappingURL=students.controller.js.map