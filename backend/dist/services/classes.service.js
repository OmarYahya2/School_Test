"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const prisma_1 = require("../lib/prisma");
class ClassesService {
    static async getAllClasses(pagination) {
        const queryOptions = {
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        subject: true,
                    },
                },
                _count: {
                    select: {
                        students: true,
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
        return prisma_1.prisma.class.findMany(queryOptions);
    }
    static async countClasses() {
        return prisma_1.prisma.class.count();
    }
    static async getClassById(id) {
        const schoolClass = await prisma_1.prisma.class.findUnique({
            where: { id },
            include: {
                teacher: true,
                students: true,
                attendance: true,
                scheduleItems: true,
            },
        });
        if (!schoolClass) {
            throw { status: 404, message: "Class not found" };
        }
        return schoolClass;
    }
    static async createClass(data) {
        const { name, teacherId, notes } = data;
        return prisma_1.prisma.class.create({
            data: {
                name,
                teacherId: teacherId || null,
                notes: notes || "",
            },
            include: {
                teacher: true,
            },
        });
    }
    static async updateClass(id, data) {
        const { name, teacherId, notes } = data;
        // Check if class exists
        await this.getClassById(id);
        return prisma_1.prisma.class.update({
            where: { id },
            data: {
                name,
                teacherId: teacherId !== undefined ? teacherId : undefined,
                notes: notes !== undefined ? notes : undefined,
            },
            include: {
                teacher: true,
            },
        });
    }
    static async deleteClass(id) {
        await this.getClassById(id);
        return prisma_1.prisma.class.delete({
            where: { id },
        });
    }
}
exports.ClassesService = ClassesService;
//# sourceMappingURL=classes.service.js.map