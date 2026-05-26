"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const prisma_1 = require("../lib/prisma");
class StudentsService {
    static async getAllStudents(pagination) {
        const queryOptions = {
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        };
        if (pagination) {
            queryOptions.skip = pagination.skip;
            queryOptions.take = pagination.take;
        }
        return prisma_1.prisma.student.findMany(queryOptions);
    }
    static async countStudents() {
        return prisma_1.prisma.student.count();
    }
    static async getStudentById(id) {
        const student = await prisma_1.prisma.student.findUnique({
            where: { id },
            include: {
                class: true,
                grades: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });
        if (!student) {
            throw { status: 404, message: "Student not found" };
        }
        return student;
    }
    static async getStudentsByClass(classId) {
        return prisma_1.prisma.student.findMany({
            where: { classId },
            orderBy: {
                name: "asc",
            },
        });
    }
    static async createStudent(data) {
        const { name, age, classId, parentPhone, notes } = data;
        // Check if class exists
        const classExists = await prisma_1.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classExists) {
            throw { status: 400, message: "Specified Class ID does not exist" };
        }
        return prisma_1.prisma.student.create({
            data: {
                name,
                age: parseInt(age, 10),
                classId,
                parentPhone,
                notes: notes || "",
            },
            include: {
                class: true,
            },
        });
    }
    static async updateStudent(id, data) {
        const { name, age, classId, parentPhone, notes } = data;
        await this.getStudentById(id);
        if (classId) {
            const classExists = await prisma_1.prisma.class.findUnique({
                where: { id: classId },
            });
            if (!classExists) {
                throw { status: 400, message: "Specified Class ID does not exist" };
            }
        }
        return prisma_1.prisma.student.update({
            where: { id },
            data: {
                name,
                age: age !== undefined ? parseInt(age, 10) : undefined,
                classId,
                parentPhone,
                notes: notes !== undefined ? notes : undefined,
            },
            include: {
                class: true,
            },
        });
    }
    static async deleteStudent(id) {
        await this.getStudentById(id);
        return prisma_1.prisma.student.delete({
            where: { id },
        });
    }
}
exports.StudentsService = StudentsService;
//# sourceMappingURL=students.service.js.map