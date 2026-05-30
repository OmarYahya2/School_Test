import { prisma } from "../lib/prisma";

async function getAssignedClassIds(teacherId: string): Promise<string[]> {
  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId },
    select: { classId: true },
    distinct: ["classId"],
  });
  const ids = assignments.map((a) => a.classId).filter((id): id is string => !!id);
  // Fallback: also include classes where teacherId is set directly (homeroom teacher)
  const homeroomClasses = await prisma.class.findMany({
    where: { teacherId },
    select: { id: true },
  });
  for (const c of homeroomClasses) {
    if (!ids.includes(c.id)) ids.push(c.id);
  }
  return ids;
}

export class TeacherDashboardService {
  static async getProfile(teacherId: string) {
    const teacher = await prisma.teacher.findUnique({
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

  static async getMyStudents(teacherId: string) {
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) return [];

    return prisma.student.findMany({
      where: { classId: { in: classIds } },
      include: { class: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    });
  }

  static async getMyClass(teacherId: string, requestedClassId?: string) {
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) {
      throw { status: 404, message: "No class assigned to this teacher" };
    }

    const targetClassId = requestedClassId && classIds.includes(requestedClassId)
      ? requestedClassId
      : classIds[0];

    const classData = await prisma.class.findUnique({
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

  static async getMyGrades(teacherId: string) {
    return prisma.grade.findMany({
      where: { teacherId },
      include: {
        student: {
          select: { id: true, name: true, class: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getMySchedule(teacherId: string) {
    return prisma.scheduleItem.findMany({
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

  static async getMyFiles(teacherId: string) {
    return prisma.subjectFile.findMany({
      where: { teacherId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getMyQR(teacherId: string, requestedClassId?: string) {
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) {
      throw { status: 404, message: "No class assigned to this teacher" };
    }
    const targetClassId = requestedClassId && classIds.includes(requestedClassId)
      ? requestedClassId
      : classIds[0];

    const classData = await prisma.class.findUnique({
      where: { id: targetClassId },
      select: { id: true, name: true },
    });
    if (!classData) {
      throw { status: 404, message: "Class not found" };
    }
    return classData;
  }

  static async getMyAnalytics(teacherId: string, requestedClassId?: string) {
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) {
      throw { status: 404, message: "No class assigned to this teacher" };
    }
    const targetClassId = requestedClassId && classIds.includes(requestedClassId)
      ? requestedClassId
      : classIds[0];

    const classData = await prisma.class.findUnique({
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

    const grades = await prisma.grade.findMany({
      where: {
        student: { classId: classData.id },
      },
      select: { grade: true, maxGrade: true },
    });

    const avgScore = grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.grade / g.maxGrade) * 100, 0) / grades.length
      : 0;

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { classId: classData.id },
    });

    let totalPresent = 0;
    let totalRecords = 0;
    for (const record of attendanceRecords) {
      const recs = record.records as Array<{ studentId: string; present: boolean }>;
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

  static async createStudentForTeacher(teacherId: string, data: any) {
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) throw { status: 403, message: "No class assigned to you" };
    // Use first assigned class as default
    return prisma.student.create({
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

  static async updateStudentForTeacher(teacherId: string, studentId: string, data: any) {
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) throw { status: 403, message: "No class assigned to you" };
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || !classIds.includes(student.classId)) throw { status: 403, message: "Student not in your class" };
    return prisma.student.update({
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

  static async deleteStudentForTeacher(teacherId: string, studentId: string) {
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) throw { status: 403, message: "No class assigned to you" };
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || !classIds.includes(student.classId)) throw { status: 403, message: "Student not in your class" };
    return prisma.student.delete({ where: { id: studentId } });
  }

  static async createGradeForTeacher(teacherId: string, data: any) {
    const { studentId, subject, grade, maxGrade, semester, academicYear, examType, notes } = data;
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0) throw { status: 403, message: "No class assigned to you" };
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student || !classIds.includes(student.classId)) throw { status: 403, message: "Student not in your class" };
    return prisma.grade.create({
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

  static async updateGradeForTeacher(teacherId: string, gradeId: string, data: any) {
    const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade || grade.teacherId !== teacherId) throw { status: 403, message: "Grade not found or not yours" };
    return prisma.grade.update({
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

  static async deleteGradeForTeacher(teacherId: string, gradeId: string) {
    const grade = await prisma.grade.findUnique({ where: { id: gradeId } });
    if (!grade || grade.teacherId !== teacherId) throw { status: 403, message: "Grade not found or not yours" };
    return prisma.grade.delete({ where: { id: gradeId } });
  }

  static async saveAttendanceForTeacher(teacherId: string, data: any) {
    const { classId, date: dateStr, records } = data;
    const classIds = await getAssignedClassIds(teacherId);
    if (classIds.length === 0 || !classIds.includes(classId)) {
      throw { status: 403, message: "Class not assigned to you" };
    }
    const date = new Date(dateStr);
    const existing = await prisma.attendanceRecord.findUnique({
      where: { classId_date: { classId, date } },
    });
    if (existing) {
      return prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: { records },
      });
    }
    return prisma.attendanceRecord.create({
      data: { classId, date, records },
    });
  }

  static async createFileForTeacher(teacherId: string, data: any) {
    const { gradeId, semester, subject, title, description, type, url } = data;
    return prisma.subjectFile.create({
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
