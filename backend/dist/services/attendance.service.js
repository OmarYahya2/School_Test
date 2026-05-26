"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const prisma_1 = require("../lib/prisma");
class AttendanceService {
    static async getAttendanceByClass(classId) {
        return prisma_1.prisma.attendanceRecord.findMany({
            where: { classId },
            orderBy: {
                date: "desc",
            },
        });
    }
    static async getAttendanceByClassAndDate(classId, dateStr) {
        const date = new Date(dateStr);
        return prisma_1.prisma.attendanceRecord.findUnique({
            where: {
                classId_date: {
                    classId,
                    date,
                },
            },
        });
    }
    static async saveAttendance(data) {
        const { classId, date: dateStr, records } = data;
        const date = new Date(dateStr);
        // Verify class exists
        const classExists = await prisma_1.prisma.class.findUnique({
            where: { id: classId },
        });
        if (!classExists) {
            throw { status: 400, message: "Class not found" };
        }
        const existing = await prisma_1.prisma.attendanceRecord.findUnique({
            where: {
                classId_date: {
                    classId,
                    date,
                },
            },
        });
        if (existing) {
            return prisma_1.prisma.attendanceRecord.update({
                where: { id: existing.id },
                data: { records },
            });
        }
        return prisma_1.prisma.attendanceRecord.create({
            data: {
                classId,
                date,
                records,
            },
        });
    }
}
exports.AttendanceService = AttendanceService;
//# sourceMappingURL=attendance.service.js.map