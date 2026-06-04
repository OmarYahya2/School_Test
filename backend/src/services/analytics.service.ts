import { prisma } from "../lib/prisma";
import { getCache, setCache } from "../utils/cache.utils";

const CACHE_KEY = "analytics:summary";
const CACHE_TTL = 120; // 2 minutes

export class AnalyticsService {
  static async getSummary() {
    const cached = getCache<ReturnType<typeof AnalyticsService.buildSummary>>(CACHE_KEY);
    if (cached) return cached;

    const summary = await AnalyticsService.buildSummary();
    setCache(CACHE_KEY, summary, CACHE_TTL);
    return summary;
  }

  static async buildSummary() {
    const now = new Date();

    // Parallel execution of count, aggregation, and group-by queries to avoid DB roundtrips and memory overhead
    const [
      totalClasses,
      totalTeachers,
      classesWithTeacherCount,
      studentsCountWithPhone,
      teachersCountWithSubject,
      avgAgeResult,
      totalStudents,
      studentsInTeacherClasses,
      attendanceStats,
      gradeStats,
      classesRaw,
      subjectCounts,
      studentClassStats,
    ] = await Promise.all([
      // totalClasses
      prisma.class.count(),
      // totalTeachers
      prisma.teacher.count(),
      // classesWithTeacherCount
      prisma.class.count({ where: { teacherId: { not: null } } }),
      // studentsCountWithPhone
      prisma.student.count({ where: { parentPhone: { not: "" } } }),
      // teachersCountWithSubject
      prisma.teacher.count({ where: { subject: { not: "" } } }),
      // avgAgeResult
      prisma.student.aggregate({ _avg: { age: true } }),
      // totalStudents
      prisma.student.count(),
      // studentsInTeacherClasses
      prisma.student.count({ where: { class: { teacherId: { not: null } } } }),
      // attendanceStats (PostgreSQL jsonb array processing)
      prisma.$queryRaw<Array<{ total_slots: number | null; present_count: number | null }>>`
        SELECT 
          COALESCE(SUM(total_cnt), 0)::int as total_slots,
          COALESCE(SUM(present_cnt), 0)::int as present_count
        FROM (
          SELECT 
            CASE 
              WHEN jsonb_typeof(records::jsonb) = 'array' THEN jsonb_array_length(records::jsonb)
              ELSE 0 
            END as total_cnt,
            CASE 
              WHEN jsonb_typeof(records::jsonb) = 'array' THEN (
                SELECT COUNT(*) 
                FROM jsonb_array_elements(records::jsonb) as elem 
                WHERE (elem->>'present')::boolean = true
              )
              ELSE 0 
            END as present_cnt
          FROM attendance_records
        ) sub
      `,
      // gradeStats
      prisma.$queryRaw<Array<{ total_grades: number | null; grade_sum: number | null; pass_count: number | null }>>`
        SELECT 
          COUNT(*)::int as total_grades,
          SUM(CASE WHEN max_grade > 0 THEN grade / max_grade ELSE 0 END)::float as grade_sum,
          COUNT(CASE WHEN max_grade > 0 AND (grade / max_grade) >= 0.6 THEN 1 END)::int as pass_count
        FROM grades
      `,
      // classesRaw (Needed for monthly growth and breakdown calculations)
      prisma.class.findMany({
        select: { id: true, name: true, teacherId: true, createdAt: true },
      }),
      // subjectCounts
      prisma.teacher.groupBy({
        by: ["subject"],
        where: { subject: { not: "" } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      // studentClassStats (Class-level student counts and avg age)
      prisma.student.groupBy({
        by: ["classId"],
        _count: { id: true },
        _avg: { age: true },
      }),
    ]);

    const averageAge = Math.round(avgAgeResult._avg.age || 0);

    const attendTotal = attendanceStats[0]?.total_slots || 0;
    const attendPresent = attendanceStats[0]?.present_count || 0;
    const attendanceRatePct = attendTotal > 0
      ? Math.round((attendPresent / attendTotal) * 1000) / 10
      : null;

    const gradesTotal = gradeStats[0]?.total_grades || 0;
    const gradesSumPct = gradeStats[0]?.grade_sum || 0;
    const gradesPassCount = gradeStats[0]?.pass_count || 0;

    const gradePassRatePct = gradesTotal > 0
      ? Math.round((gradesPassCount / gradesTotal) * 100)
      : null;
    const gradeAveragePct = gradesTotal > 0
      ? Math.round((gradesSumPct / gradesTotal) * 100)
      : null;

    // ── Monthly Cumulative Growth ──────────────────────────────────────────
    // Parallel counts for each historical month cutoff
    const monthlyGrowth = await Promise.all(
      Array.from({ length: 6 }, async (_, i) => {
        const ref = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const cutoff = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59);

        const [studentsCount, classesCount, teachersCount] = await Promise.all([
          prisma.student.count({ where: { createdAt: { lte: cutoff } } }),
          prisma.class.count({ where: { createdAt: { lte: cutoff } } }),
          prisma.teacher.count({ where: { createdAt: { lte: cutoff } } }),
        ]);

        return {
          month: ref.toISOString(),
          students: studentsCount,
          classes: classesCount,
          teachers: teachersCount,
        };
      })
    );

    // ── Chart: students per class ──────────────────────────────────────────
    const classBreakdown = classesRaw
      .map((cls) => {
        const stat = studentClassStats.find((s) => s.classId === cls.id);
        return {
          name: cls.name,
          students: stat?._count.id || 0,
          averageAge: stat?._avg.age ? Math.round(stat._avg.age * 10) / 10 : 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, "ar"));

    // ── Chart: age distribution (calculated in a single raw query)
    const ageDistributionRaw = await prisma.$queryRaw<Array<{
      range_6_8: number;
      range_9_11: number;
      range_12_14: number;
      range_15_17: number;
      range_18_plus: number;
    }>>`
      SELECT 
        COUNT(CASE WHEN age BETWEEN 6 AND 8 THEN 1 END)::int as range_6_8,
        COUNT(CASE WHEN age BETWEEN 9 AND 11 THEN 1 END)::int as range_9_11,
        COUNT(CASE WHEN age BETWEEN 12 AND 14 THEN 1 END)::int as range_12_14,
        COUNT(CASE WHEN age BETWEEN 15 AND 17 THEN 1 END)::int as range_15_17,
        COUNT(CASE WHEN age >= 18 THEN 1 END)::int as range_18_plus
      FROM students
    `;

    const dist = ageDistributionRaw[0] || { range_6_8: 0, range_9_11: 0, range_12_14: 0, range_15_17: 0, range_18_plus: 0 };
    const ageDistribution = [
      { range: "6-8",   count: dist.range_6_8 },
      { range: "9-11",  count: dist.range_9_11 },
      { range: "12-14", count: dist.range_12_14 },
      { range: "15-17", count: dist.range_15_17 },
      { range: "18+",   count: dist.range_18_plus },
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
        grades: gradesTotal,
      },
      quality: {
        classesWithTeacher: classesWithTeacherCount,
        studentsWithPhone: studentsCountWithPhone,
        studentsInTeacherClasses,
        teachersWithSubject: teachersCountWithSubject,
        averageAge,
        teacherClassRatioPct:
          totalClasses > 0
            ? Math.round((classesWithTeacherCount / totalClasses) * 100)
            : 0,
        studentPhoneRatioPct:
          totalStudents > 0
            ? Math.round((studentsCountWithPhone / totalStudents) * 100)
            : 0,
      },
      attendance: {
        ratePct: attendanceRatePct,
        totalSlots: attendTotal,
        presentCount: attendPresent,
      },
      grades: {
        averagePct: gradeAveragePct,
        passRatePct: gradePassRatePct,
        totalRecords: gradesTotal,
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
