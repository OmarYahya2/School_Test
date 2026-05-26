import { prisma } from "../lib/prisma";

export class GradesService {
  static async getAllGrades(pagination?: { skip: number; take: number }) {
    const queryOptions: any = {
      include: {
        student: {
          select: {
            id: true,
            name: true,
            classId: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    if (pagination) {
      queryOptions.skip = pagination.skip;
      queryOptions.take = pagination.take;
    }

    return prisma.grade.findMany(queryOptions);
  }

  static async countGrades() {
    return prisma.grade.count();
  }

  static async getGradesByStudent(studentId: string) {
    return prisma.grade.findMany({
      where: { studentId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async getGradesByClass(classId: string) {
    return prisma.grade.findMany({
      where: {
        student: {
          classId,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  static async createGrade(data: any) {
    const { studentId, subject, grade, maxGrade, semester, academicYear, examType, teacherId, notes } = data;

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      throw { status: 400, message: "Student not found" };
    }

    return prisma.grade.create({
      data: {
        studentId,
        subject,
        grade: parseFloat(grade),
        maxGrade: parseFloat(maxGrade),
        semester: semester || "first",
        academicYear: academicYear || new Date().getFullYear().toString(),
        examType: examType || "exam",
        teacherId: teacherId || null,
        notes: notes || "",
      },
      include: {
        student: true,
      },
    });
  }

  static async updateGrade(id: string, data: any) {
    const { subject, grade, maxGrade, semester, academicYear, examType, teacherId, notes } = data;

    const existing = await prisma.grade.findUnique({
      where: { id },
    });
    if (!existing) {
      throw { status: 404, message: "Grade record not found" };
    }

    return prisma.grade.update({
      where: { id },
      data: {
        subject,
        grade: grade !== undefined ? parseFloat(grade) : undefined,
        maxGrade: maxGrade !== undefined ? parseFloat(maxGrade) : undefined,
        semester,
        academicYear,
        examType,
        teacherId: teacherId !== undefined ? teacherId : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
      include: {
        student: true,
      },
    });
  }

  static async deleteGrade(id: string) {
    const existing = await prisma.grade.findUnique({
      where: { id },
    });
    if (!existing) {
      throw { status: 404, message: "Grade record not found" };
    }

    return prisma.grade.delete({
      where: { id },
    });
  }
}
