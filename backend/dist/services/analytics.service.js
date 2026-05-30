"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = require("../lib/prisma");
const cache_utils_1 = require("../utils/cache.utils");
const CACHE_KEY = "analytics:summary";
const CACHE_TTL = 120; // 2 minutes
class AnalyticsService {
    static async getSummary() {
        const cached = (0, cache_utils_1.getCache)(CACHE_KEY);
        if (cached)
            return cached;
        const summary = await AnalyticsService.buildSummary();
        (0, cache_utils_1.setCache)(CACHE_KEY, summary, CACHE_TTL);
        return summary;
    }
    static async buildSummary() {
        const now = new Date();
        // Single parallel batch — minimise DB roundtrips
        const [totalClasses, totalTeachers, classesWithTeacherCount, allAttendance, allGrades, allStudents, classesRaw, teachersRaw, subjectCounts,] = await Promise.all([
            prisma_1.prisma.class.count(),
            prisma_1.prisma.teacher.count(),
            prisma_1.prisma.class.count({ where: { teacherId: { not: null } } }),
            prisma_1.prisma.attendanceRecord.findMany({ select: { records: true } }),
            prisma_1.prisma.grade.findMany({ select: { grade: true, maxGrade: true } }),
            prisma_1.prisma.student.findMany({
                select: { id: true, classId: true, createdAt: true, age: true, parentPhone: true },
            }),
            prisma_1.prisma.class.findMany({
                select: { id: true, name: true, teacherId: true, createdAt: true },
            }),
            prisma_1.prisma.teacher.findMany({
                select: { id: true, subject: true, createdAt: true },
            }),
            prisma_1.prisma.teacher.groupBy({
                by: ["subject"],
                where: { subject: { not: "" } },
                _count: { id: true },
                orderBy: { _count: { id: "desc" } },
            }),
        ]);
        const totalStudents = allStudents.length;
        const studentsWithPhone = allStudents.filter((s) => s.parentPhone?.trim()).length;
        const teachersWithSubject = teachersRaw.filter((t) => t.subject?.trim()).length;
        const averageAge = allStudents.length > 0
            ? Math.round(allStudents.reduce((sum, s) => sum + s.age, 0) / allStudents.length)
            : 0;
        // ── Real attendance rate ────────────────────────────────────────────────
        let presentCount = 0;
        let totalSlots = 0;
        for (const record of allAttendance) {
            const recs = record.records;
            if (Array.isArray(recs)) {
                for (const r of recs) {
                    totalSlots++;
                    if (r.present)
                        presentCount++;
                }
            }
        }
        const attendanceRatePct = totalSlots > 0
            ? Math.round((presentCount / totalSlots) * 1000) / 10
            : null;
        // ── Real grade statistics ──────────────────────────────────────────────
        let passCount = 0;
        let gradeSum = 0;
        for (const g of allGrades) {
            const pct = g.maxGrade > 0 ? g.grade / g.maxGrade : 0;
            gradeSum += pct;
            if (pct >= 0.6)
                passCount++;
        }
        const gradePassRatePct = allGrades.length > 0
            ? Math.round((passCount / allGrades.length) * 100)
            : null;
        const gradeAveragePct = allGrades.length > 0
            ? Math.round((gradeSum / allGrades.length) * 100)
            : null;
        // ── Students in teacher-assigned classes ───────────────────────────────
        const teacherClassIds = new Set(classesRaw.filter((c) => c.teacherId).map((c) => c.id));
        const studentsInTeacherClasses = allStudents.filter((s) => teacherClassIds.has(s.classId)).length;
        // ── Real monthly cumulative growth from createdAt ──────────────────────
        const monthlyGrowth = Array.from({ length: 6 }, (_, i) => {
            const ref = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const cutoff = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59);
            return {
                month: ref.toISOString(),
                students: allStudents.filter((s) => new Date(s.createdAt) <= cutoff).length,
                classes: classesRaw.filter((c) => new Date(c.createdAt) <= cutoff).length,
                teachers: teachersRaw.filter((t) => new Date(t.createdAt) <= cutoff).length,
            };
        });
        // ── Chart: students per class ──────────────────────────────────────────
        const classBreakdown = classesRaw
            .map((cls) => {
            const cls_students = allStudents.filter((s) => s.classId === cls.id);
            return {
                name: cls.name,
                students: cls_students.length,
                averageAge: cls_students.length > 0
                    ? Math.round((cls_students.reduce((sum, s) => sum + s.age, 0) /
                        cls_students.length) *
                        10) / 10
                    : 0,
            };
        })
            .sort((a, b) => a.name.localeCompare(b.name, "ar"));
        // ── Chart: age distribution ────────────────────────────────────────────
        const ageDistribution = [
            { range: "6-8", count: allStudents.filter((s) => s.age >= 6 && s.age <= 8).length },
            { range: "9-11", count: allStudents.filter((s) => s.age >= 9 && s.age <= 11).length },
            { range: "12-14", count: allStudents.filter((s) => s.age >= 12 && s.age <= 14).length },
            { range: "15-17", count: allStudents.filter((s) => s.age >= 15 && s.age <= 17).length },
            { range: "18+", count: allStudents.filter((s) => s.age >= 18).length },
        ];
        // ── Chart: subject distribution ────────────────────────────────────────
        const subjectDistribution = subjectCounts.map((s) => ({
            subject: s.subject,
            count: s._count.id,
        }));
        return {
            totals: {
                students: totalStudents,
                classes: totalClasses,
                teachers: totalTeachers,
                grades: allGrades.length,
            },
            quality: {
                classesWithTeacher: classesWithTeacherCount,
                studentsWithPhone,
                studentsInTeacherClasses,
                teachersWithSubject,
                averageAge,
                teacherClassRatioPct: totalClasses > 0
                    ? Math.round((classesWithTeacherCount / totalClasses) * 100)
                    : 0,
                studentPhoneRatioPct: totalStudents > 0
                    ? Math.round((studentsWithPhone / totalStudents) * 100)
                    : 0,
            },
            attendance: {
                ratePct: attendanceRatePct,
                totalSlots,
                presentCount,
            },
            grades: {
                averagePct: gradeAveragePct,
                passRatePct: gradePassRatePct,
                totalRecords: allGrades.length,
            },
            monthlyGrowth,
            charts: {
                classBreakdown,
                ageDistribution,
                subjectDistribution,
            },
        };
    }
    static invalidateCache() {
        const { delCache } = require("../utils/cache.utils");
        delCache(CACHE_KEY);
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map