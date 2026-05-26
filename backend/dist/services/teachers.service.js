"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const prisma_1 = require("../lib/prisma");
class TeachersService {
    static async getAllTeachers(pagination) {
        const queryOptions = {
            include: {
                classes: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                teacherAssignments: true,
            },
            orderBy: {
                name: "asc",
            },
        };
        if (pagination) {
            queryOptions.skip = pagination.skip;
            queryOptions.take = pagination.take;
        }
        return prisma_1.prisma.teacher.findMany(queryOptions);
    }
    static async countTeachers() {
        return prisma_1.prisma.teacher.count();
    }
    static async getTeacherById(id) {
        const teacher = await prisma_1.prisma.teacher.findUnique({
            where: { id },
            include: {
                classes: true,
                teacherAssignments: true,
            },
        });
        if (!teacher) {
            throw { status: 404, message: "Teacher not found" };
        }
        return teacher;
    }
    static async createTeacher(data) {
        const { name, phone, subject } = data;
        return prisma_1.prisma.teacher.create({
            data: {
                name,
                phone,
                subject,
            },
        });
    }
    static async deleteTeacher(id) {
        await this.getTeacherById(id);
        return prisma_1.prisma.teacher.delete({
            where: { id },
        });
    }
    // --- Teacher Assignments ---
    static async getAllAssignments() {
        return prisma_1.prisma.teacherAssignment.findMany({
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        subject: true,
                    },
                },
            },
        });
    }
    static async assignTeacher(data) {
        const { teacherId, gradeId, semester, subject } = data;
        // Check if teacher exists
        const teacher = await prisma_1.prisma.teacher.findUnique({
            where: { id: teacherId },
        });
        if (!teacher) {
            throw { status: 400, message: "Teacher not found" };
        }
        // Upsert assignment (if exists, recreate or update to match unique constraint)
        const existing = await prisma_1.prisma.teacherAssignment.findUnique({
            where: {
                gradeId_semester_subject: {
                    gradeId: parseInt(gradeId, 10),
                    semester,
                    subject,
                },
            },
        });
        if (existing) {
            return prisma_1.prisma.teacherAssignment.update({
                where: { id: existing.id },
                data: { teacherId },
                include: { teacher: true },
            });
        }
        return prisma_1.prisma.teacherAssignment.create({
            data: {
                teacherId,
                gradeId: parseInt(gradeId, 10),
                semester,
                subject,
            },
            include: { teacher: true },
        });
    }
    static async removeAssignment(id) {
        const assignment = await prisma_1.prisma.teacherAssignment.findUnique({
            where: { id },
        });
        if (!assignment) {
            throw { status: 404, message: "Assignment not found" };
        }
        return prisma_1.prisma.teacherAssignment.delete({
            where: { id },
        });
    }
}
exports.TeachersService = TeachersService;
//# sourceMappingURL=teachers.service.js.map