"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherDashboardService = void 0;
const prisma_1 = require("../lib/prisma");
async function getAssignedClassIds(teacherId) {
    const assignments = await prisma_1.prisma.teacherAssignment.findMany({
        where: { teacherId },
        select: { classId: true },
        distinct: ["classId"],
    });
    const ids = assignments.map((a) => a.classId).filter((id) => !!id);
    // Fallback: also include classes where teacherId is set directly (homeroom teacher)
    const homeroomClasses = await prisma_1.prisma.class.findMany({
        where: { teacherId },
        select: { id: true },
    });
    for (const c of homeroomClasses) {
        if (!ids.includes(c.id))
            ids.push(c.id);
    }
    return ids;
}
class TeacherDashboardService {
    static async getProfile(teacherId) {
        const teacher = await prisma_1.prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                classes: {
                    select: { id: true, name: true },
                },
                teacherAssignments: {
                    include: {
                        class: { select: { id: true, name: true } },
                    },
                },
            },
        });
        if (!teacher) {
            throw { status: 404, message: "Teacher not found" };
        }
        return teacher;
    }
    static async getMyStudents(teacherId) {
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0)
            return [];
        return prisma_1.prisma.student.findMany({
            where: { classId: { in: classIds } },
            include: { class: { select: { id: true, name: true } } },
            orderBy: { name: "asc" },
        });
    }
    static async getMyClass(teacherId, requestedClassId) {
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0) {
            throw { status: 404, message: "No class assigned to this teacher" };
        }
        const targetClassId = requestedClassId && classIds.includes(requestedClassId)
            ? requestedClassId
            : classIds[0];
        const classData = await prisma_1.prisma.class.findUnique({
            where: { id: targetClassId },
            include: {
                students: { select: { id: true, name: true, age: true } },
                scheduleItems: true,
            },
        });
        if (!classData) {
            throw { status: 404, message: "Class not found" };
        }
        return classData;
    }
    static async getMyGrades(teacherId) {
        return prisma_1.prisma.grade.findMany({
            where: { teacherId },
            include: {
                student: {
                    select: { id: true, name: true, class: { select: { name: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
    static async getMySchedule(teacherId) {
        return prisma_1.prisma.scheduleItem.findMany({
            where: { teacherId },
            include: {
                class: { select: { id: true, name: true } },
            },
            orderBy: [
                { dayOfWeek: "asc" },
                { periodNumber: "asc" },
            ],
        });
    }
    static async getMyFiles(teacherId) {
        return prisma_1.prisma.subjectFile.findMany({
            where: { teacherId },
            orderBy: { createdAt: "desc" },
        });
    }
    static async getMyQR(teacherId, requestedClassId) {
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0) {
            throw { status: 404, message: "No class assigned to this teacher" };
        }
        const targetClassId = requestedClassId && classIds.includes(requestedClassId)
            ? requestedClassId
            : classIds[0];
        const classData = await prisma_1.prisma.class.findUnique({
            where: { id: targetClassId },
            select: { id: true, name: true },
        });
        if (!classData) {
            throw { status: 404, message: "Class not found" };
        }
        return classData;
    }
    static async getMyAnalytics(teacherId, requestedClassId) {
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0) {
            throw { status: 404, message: "No class assigned to this teacher" };
        }
        const targetClassId = requestedClassId && classIds.includes(requestedClassId)
            ? requestedClassId
            : classIds[0];
        const classData = await prisma_1.prisma.class.findUnique({
            where: { id: targetClassId },
            include: {
                students: { select: { id: true, name: true } },
                _count: { select: { students: true } },
            },
        });
        if (!classData) {
            throw { status: 404, message: "Class not found" };
        }
        const studentCount = classData._count.students;
        const grades = await prisma_1.prisma.grade.findMany({
            where: {
                student: { classId: classData.id },
            },
            select: { grade: true, maxGrade: true },
        });
        const avgScore = grades.length > 0
            ? grades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / grades.length
            : 0;
        const attendanceRecords = await prisma_1.prisma.attendanceRecord.findMany({
            where: { classId: classData.id },
        });
        let totalPresent = 0;
        let totalRecords = 0;
        for (const record of attendanceRecords) {
            const recs = record.records;
            totalRecords += recs.length;
            totalPresent += recs.filter((r) => r.present).length;
        }
        const attendanceRate = totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0;
        return {
            class: { id: classData.id, name: classData.name },
            studentCount,
            averageScore: Number(avgScore.toFixed(1)),
            attendanceRate: Number(attendanceRate.toFixed(1)),
            totalGrades: grades.length,
        };
    }
    static async createStudentForTeacher(teacherId, data) {
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0)
            throw { status: 403, message: "No class assigned to you" };
        // Use first assigned class as default
        return prisma_1.prisma.student.create({
            data: {
                name: data.name,
                age: parseInt(data.age, 10),
                classId: data.classId && classIds.includes(data.classId) ? data.classId : classIds[0],
                parentPhone: data.parentPhone || null,
                notes: data.notes || "",
            },
            include: { class: { select: { id: true, name: true } } },
        });
    }
    static async updateStudentForTeacher(teacherId, studentId, data) {
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0)
            throw { status: 403, message: "No class assigned to you" };
        const student = await prisma_1.prisma.student.findUnique({ where: { id: studentId } });
        if (!student || !classIds.includes(student.classId))
            throw { status: 403, message: "Student not in your class" };
        return prisma_1.prisma.student.update({
            where: { id: studentId },
            data: {
                name: data.name,
                age: data.age !== undefined ? parseInt(data.age, 10) : undefined,
                parentPhone: data.parentPhone,
                notes: data.notes,
            },
            include: { class: { select: { id: true, name: true } } },
        });
    }
    static async deleteStudentForTeacher(teacherId, studentId) {
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0)
            throw { status: 403, message: "No class assigned to you" };
        const student = await prisma_1.prisma.student.findUnique({ where: { id: studentId } });
        if (!student || !classIds.includes(student.classId))
            throw { status: 403, message: "Student not in your class" };
        return prisma_1.prisma.student.delete({ where: { id: studentId } });
    }
    static async createGradeForTeacher(teacherId, data) {
        const { studentId, subject, grade, maxGrade, semester, academicYear, examType, notes } = data;
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0)
            throw { status: 403, message: "No class assigned to you" };
        const student = await prisma_1.prisma.student.findUnique({ where: { id: studentId } });
        if (!student || !classIds.includes(student.classId))
            throw { status: 403, message: "Student not in your class" };
        return prisma_1.prisma.grade.create({
            data: {
                studentId,
                subject,
                grade: parseFloat(grade),
                maxGrade: parseFloat(maxGrade),
                semester: semester || "first",
                academicYear: academicYear || new Date().getFullYear().toString(),
                examType: examType || "exam",
                teacherId,
                notes: notes || "",
            },
            include: { student: { select: { id: true, name: true, class: { select: { name: true } } } } },
        });
    }
    static async updateGradeForTeacher(teacherId, gradeId, data) {
        const grade = await prisma_1.prisma.grade.findUnique({ where: { id: gradeId } });
        if (!grade || grade.teacherId !== teacherId)
            throw { status: 403, message: "Grade not found or not yours" };
        return prisma_1.prisma.grade.update({
            where: { id: gradeId },
            data: {
                subject: data.subject,
                grade: data.grade !== undefined ? parseFloat(data.grade) : undefined,
                maxGrade: data.maxGrade !== undefined ? parseFloat(data.maxGrade) : undefined,
                semester: data.semester,
                academicYear: data.academicYear,
                examType: data.examType,
                notes: data.notes,
            },
            include: { student: { select: { id: true, name: true, class: { select: { name: true } } } } },
        });
    }
    static async deleteGradeForTeacher(teacherId, gradeId) {
        const grade = await prisma_1.prisma.grade.findUnique({ where: { id: gradeId } });
        if (!grade || grade.teacherId !== teacherId)
            throw { status: 403, message: "Grade not found or not yours" };
        return prisma_1.prisma.grade.delete({ where: { id: gradeId } });
    }
    static async saveAttendanceForTeacher(teacherId, data) {
        const { classId, date: dateStr, records } = data;
        const classIds = await getAssignedClassIds(teacherId);
        if (classIds.length === 0 || !classIds.includes(classId)) {
            throw { status: 403, message: "Class not assigned to you" };
        }
        const date = new Date(dateStr);
        const existing = await prisma_1.prisma.attendanceRecord.findUnique({
            where: { classId_date: { classId, date } },
        });
        if (existing) {
            return prisma_1.prisma.attendanceRecord.update({
                where: { id: existing.id },
                data: { records },
            });
        }
        return prisma_1.prisma.attendanceRecord.create({
            data: { classId, date, records },
        });
    }
    static async createFileForTeacher(teacherId, data) {
        const { gradeId, semester, subject, title, description, type, url } = data;
        return prisma_1.prisma.subjectFile.create({
            data: {
                gradeId: parseInt(gradeId, 10),
                semester,
                subject,
                teacherId,
                title,
                description: description || "",
                type,
                url,
            },
            include: { teacher: { select: { id: true, name: true } } },
        });
    }
}
exports.TeacherDashboardService = TeacherDashboardService;
//# sourceMappingURL=teacher-dashboard.service.js.map