import { prisma } from "../lib/prisma";

export class TeachersService {
  static async getAllTeachers(pagination?: { skip: number; take: number }) {
    const queryOptions: any = {
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

    return prisma.teacher.findMany(queryOptions);
  }

  static async countTeachers() {
    return prisma.teacher.count();
  }

  static async getTeacherById(id: string) {
    const teacher = await prisma.teacher.findUnique({
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

  static async createTeacher(data: any) {
    const { name, phone, subject } = data;
    return prisma.teacher.create({
      data: {
        name,
        phone,
        subject,
      },
    });
  }

  static async deleteTeacher(id: string) {
    await this.getTeacherById(id);
    return prisma.teacher.delete({
      where: { id },
    });
  }

  // --- Teacher Assignments ---

  static async getAllAssignments() {
    return prisma.teacherAssignment.findMany({
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

  static async assignTeacher(data: any) {
    const { teacherId, gradeId, semester, subject } = data;

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
    });
    if (!teacher) {
      throw { status: 400, message: "Teacher not found" };
    }

    // Upsert assignment (if exists, recreate or update to match unique constraint)
    const existing = await prisma.teacherAssignment.findUnique({
      where: {
        gradeId_semester_subject: {
          gradeId: parseInt(gradeId, 10),
          semester,
          subject,
        },
      },
    });

    if (existing) {
      return prisma.teacherAssignment.update({
        where: { id: existing.id },
        data: { teacherId },
        include: { teacher: true },
      });
    }

    return prisma.teacherAssignment.create({
      data: {
        teacherId,
        gradeId: parseInt(gradeId, 10),
        semester,
        subject,
      },
      include: { teacher: true },
    });
  }

  static async removeAssignment(id: string) {
    const assignment = await prisma.teacherAssignment.findUnique({
      where: { id },
    });
    if (!assignment) {
      throw { status: 404, message: "Assignment not found" };
    }

    return prisma.teacherAssignment.delete({
      where: { id },
    });
  }
}
