"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersController = void 0;
const teachers_service_1 = require("../services/teachers.service");
const response_utils_1 = require("../utils/response.utils");
const pagination_utils_1 = require("../utils/pagination.utils");
class TeachersController {
    static async getAll(req, res, next) {
        try {
            const { page, limit } = req.query;
            if (page || limit) {
                const { skip, take, page: p, limit: l } = (0, pagination_utils_1.getPaginationParams)(req.query);
                const [teachers, total] = await Promise.all([
                    teachers_service_1.TeachersService.getAllTeachers({ skip, take }),
                    teachers_service_1.TeachersService.countTeachers(),
                ]);
                const totalPages = Math.ceil(total / l);
                return (0, response_utils_1.sendPaginatedSuccess)(res, teachers, { total, page: p, limit: l, totalPages }, "Teachers fetched successfully");
            }
            const teachers = await teachers_service_1.TeachersService.getAllTeachers();
            return (0, response_utils_1.sendSuccess)(res, teachers, "Teachers fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const teacher = await teachers_service_1.TeachersService.getTeacherById(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, teacher, "Teacher fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async create(req, res, next) {
        try {
            const teacher = await teachers_service_1.TeachersService.createTeacher(req.body);
            return (0, response_utils_1.sendSuccess)(res, teacher, "Teacher created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async delete(req, res, next) {
        try {
            await teachers_service_1.TeachersService.deleteTeacher(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Teacher deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
    // --- Admin Teacher Account Management ---
    static async getAccounts(req, res, next) {
        try {
            const accounts = await teachers_service_1.TeachersService.getTeacherAccounts();
            return (0, response_utils_1.sendSuccess)(res, accounts, "Teacher accounts fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async createAccount(req, res, next) {
        try {
            const account = await teachers_service_1.TeachersService.createTeacherAccount(req.body);
            return (0, response_utils_1.sendSuccess)(res, account, "Teacher account created successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async updateAccount(req, res, next) {
        try {
            const account = await teachers_service_1.TeachersService.updateTeacherAccount(req.params.id, req.body);
            return (0, response_utils_1.sendSuccess)(res, account, "Teacher account updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteAccount(req, res, next) {
        try {
            await teachers_service_1.TeachersService.deleteTeacherAccount(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Teacher account deleted successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleStatus(req, res, next) {
        try {
            const account = await teachers_service_1.TeachersService.toggleTeacherStatus(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, account, "Teacher status updated successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async resetPassword(req, res, next) {
        try {
            const { password } = req.body;
            await teachers_service_1.TeachersService.resetTeacherPassword(req.params.id, password);
            return (0, response_utils_1.sendSuccess)(res, null, "Password reset successfully");
        }
        catch (error) {
            next(error);
        }
    }
    // --- Assignments ---
    static async getAllAssignments(req, res, next) {
        try {
            const assignments = await teachers_service_1.TeachersService.getAllAssignments();
            return (0, response_utils_1.sendSuccess)(res, assignments, "Teacher assignments fetched successfully");
        }
        catch (error) {
            next(error);
        }
    }
    static async assignTeacher(req, res, next) {
        try {
            const assignment = await teachers_service_1.TeachersService.assignTeacher(req.body);
            return (0, response_utils_1.sendSuccess)(res, assignment, "Teacher assigned successfully", 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async removeAssignment(req, res, next) {
        try {
            await teachers_service_1.TeachersService.removeAssignment(req.params.id);
            return (0, response_utils_1.sendSuccess)(res, null, "Teacher assignment removed successfully");
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TeachersController = TeachersController;
//# sourceMappingURL=teachers.controller.js.map